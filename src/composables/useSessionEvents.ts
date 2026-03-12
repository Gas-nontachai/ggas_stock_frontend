import Swal from "sweetalert2";

type SessionReplacedSignal = {
  type: "SESSION_REPLACED";
  message?: string;
  ts: number;
};

const DIALOG_LOCK_KEY = "ggas:session_replaced_dialog_lock";
const SIGNAL_KEY = "ggas:session_replaced_signal";
const LOCK_TTL_MS = 15000;
const RECONNECT_DELAYS_MS = [1000, 2000, 5000];

let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let currentToken: string | null = null;
let stopRequested = false;
let handlingSessionReplaced = false;
let handlingSessionExpired = false;
let validatingAfterError = false;
let channel: BroadcastChannel | null = null;
let storageListenerAttached = false;

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const closeStream = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};

const getI18nText = (key: string, fallback: string) => {
  const nuxtApp = useNuxtApp();
  const i18n = (nuxtApp as any).$i18n;
  const text = i18n?.t?.(key);
  if (typeof text === "string" && text !== key) {
    return text;
  }
  return fallback;
};

const getSessionReplacedMessage = (message?: string) =>
  message || getI18nText("session.replacedText", "Your account was logged in from another device");

const parseEventMessage = (raw: string | null | undefined) => {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.message === "string" && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {
    // Ignore malformed payload and fallback to default message.
  }

  return undefined;
};

const canShowDialogInThisTab = () => {
  if (!process.client) {
    return false;
  }

  const now = Date.now();
  const raw = localStorage.getItem(DIALOG_LOCK_KEY);
  const lockValue = raw ? Number(raw) : NaN;
  const hasValidLock = Number.isFinite(lockValue) && now - lockValue < LOCK_TTL_MS;

  if (hasValidLock) {
    return false;
  }

  localStorage.setItem(DIALOG_LOCK_KEY, String(now));
  return true;
};

const releaseDialogLock = () => {
  if (!process.client) {
    return;
  }
  localStorage.removeItem(DIALOG_LOCK_KEY);
};

const toLogin = () => {
  if (!process.client) {
    return;
  }

  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
};

const performForcedLogout = async (showDialog: boolean, message?: string) => {
  if (handlingSessionReplaced) {
    return;
  }

  handlingSessionReplaced = true;
  const { clearSession } = useSession();

  try {
    if (showDialog) {
      await Swal.fire({
        title: getI18nText("session.replacedTitle", "Session replaced"),
        text: getSessionReplacedMessage(message),
        icon: "warning",
        confirmButtonText: getI18nText("button.confirm", "OK"),
      });
    }
  } finally {
    stopRequested = true;
    clearReconnectTimer();
    closeStream();
    currentToken = null;
    reconnectAttempt = 0;

    clearSession();
    toLogin();

    if (showDialog) {
      releaseDialogLock();
    }
    handlingSessionReplaced = false;
  }
};

const performSessionExpiredLogout = async () => {
  if (handlingSessionExpired) {
    return;
  }

  handlingSessionExpired = true;
  const { clearSession } = useSession();

  try {
    await Swal.fire({
      title: "Session expired",
      text: "Please login again.",
      icon: "warning",
      confirmButtonText: "OK",
    });
  } finally {
    stopRequested = true;
    clearReconnectTimer();
    closeStream();
    currentToken = null;
    reconnectAttempt = 0;

    clearSession();
    toLogin();
    handlingSessionExpired = false;
  }
};

const dispatchSignal = (message?: string) => {
  if (!process.client) {
    return;
  }

  const payload: SessionReplacedSignal = {
    type: "SESSION_REPLACED",
    message,
    ts: Date.now(),
  };

  if (channel) {
    channel.postMessage(payload);
  }

  localStorage.setItem(SIGNAL_KEY, JSON.stringify(payload));
};

const onSignal = async (payload: SessionReplacedSignal) => {
  if (payload?.type !== "SESSION_REPLACED") {
    return;
  }

  const showDialog = canShowDialogInThisTab();
  await performForcedLogout(showDialog, payload.message);
};

const initCrossTab = () => {
  if (!process.client) {
    return;
  }

  if (!channel && typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("ggas-session-events");
    channel.onmessage = async (event: MessageEvent<SessionReplacedSignal>) => {
      await onSignal(event.data);
    };
  }

  if (!storageListenerAttached) {
    window.addEventListener("storage", async (event) => {
      if (event.key !== SIGNAL_KEY || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as SessionReplacedSignal;
        await onSignal(payload);
      } catch {
        // Ignore malformed storage payload.
      }
    });
    storageListenerAttached = true;
  }
};

const scheduleReconnect = () => {
  if (!process.client || stopRequested || !currentToken) {
    return;
  }

  const delay =
    RECONNECT_DELAYS_MS[Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];

  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    reconnectAttempt += 1;
    connect();
  }, delay);
};

const validateTokenAfterStreamError = async () => {
  if (!process.client || !currentToken || stopRequested || validatingAfterError) {
    return;
  }

  validatingAfterError = true;
  const token = currentToken;

  try {
    const url = `${useRuntimeConfig().public.apiBaseUrl}/auth/me`;
    await $fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    scheduleReconnect();
  } catch (error: any) {
    const status = error?.response?.status;
    const code = error?.response?._data?.error?.code;
    const message =
      error?.response?._data?.error?.message || error?.response?._data?.message;

    if (status === 401 && code === "AUTH_SESSION_REPLACED") {
      await handleSessionReplaced(message);
      return;
    }

    if (status === 401 && (code === "AUTH_TOKEN_INVALID" || code === "AUTH_TOKEN_MISSING")) {
      await performSessionExpiredLogout();
      return;
    }

    scheduleReconnect();
  } finally {
    validatingAfterError = false;
  }
};

const connect = () => {
  if (!process.client || stopRequested || !currentToken) {
    return;
  }

  closeStream();

  const baseUrl = useRuntimeConfig().public.apiBaseUrl;
  const url = `${baseUrl}/auth/session-events?access_token=${encodeURIComponent(currentToken)}`;

  eventSource = new EventSource(url);

  eventSource.onopen = () => {
    reconnectAttempt = 0;
  };

  eventSource.addEventListener("connected", () => {
    reconnectAttempt = 0;
  });

  eventSource.addEventListener("session_replaced", async (event: MessageEvent) => {
    const message = parseEventMessage(event.data);
    await handleSessionReplaced(message);
  });

  eventSource.onerror = () => {
    closeStream();
    void validateTokenAfterStreamError();
  };
};

const start = (token: string) => {
  if (!process.client || !token) {
    return;
  }

  initCrossTab();
  stopRequested = false;
  clearReconnectTimer();

  if (currentToken === token && eventSource) {
    return;
  }

  currentToken = token;
  reconnectAttempt = 0;
  connect();
};

const stop = () => {
  stopRequested = true;
  clearReconnectTimer();
  closeStream();
  currentToken = null;
  reconnectAttempt = 0;
};

const handleSessionReplaced = async (message?: string) => {
  if (!process.client) {
    return;
  }

  initCrossTab();
  const showDialog = canShowDialogInThisTab();
  dispatchSignal(message);
  await performForcedLogout(showDialog, message);
};

export default function useSessionEvents() {
  return {
    start,
    stop,
    handleSessionReplaced,
  };
}
