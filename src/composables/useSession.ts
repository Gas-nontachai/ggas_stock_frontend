import type { AuthToken, User } from "@/misc/type";

type SessionPayload = AuthToken & {
  user?: User | null;
};

const COOKIE_BASE_OPTIONS = {
  sameSite: "lax" as const,
  path: "/",
};

export default function useSession() {
  const accessToken = useCookie<string | null>("access_token", COOKIE_BASE_OPTIONS);
  const refreshToken = useCookie<string | null>("refresh_token", COOKIE_BASE_OPTIONS);
  const authUser = useCookie<User | null>("auth_user", COOKIE_BASE_OPTIONS);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const setSession = (payload: SessionPayload) => {
    accessToken.value = payload.access_token;
    refreshToken.value = payload.refresh_token;

    if (payload.user !== undefined) {
      authUser.value = payload.user;
    }
  };

  const setUser = (user: User | null) => {
    authUser.value = user;
  };

  const clearSession = () => {
    accessToken.value = null;
    refreshToken.value = null;
    authUser.value = null;
  };

  return {
    accessToken,
    refreshToken,
    authUser,
    isAuthenticated,
    setSession,
    setUser,
    clearSession,
  };
}
