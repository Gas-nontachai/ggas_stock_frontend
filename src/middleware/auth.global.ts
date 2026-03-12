export default defineNuxtRouteMiddleware(async (to) => {
  const legacyAuthPaths = ["/auth/register", "/auth/forget-password"];

  if (legacyAuthPaths.includes(to.path)) {
    return navigateTo({
      path: "/auth/login",
      query: { reason: "legacy_auth_moved" },
    });
  }

  const { isAuthenticated, authUser, clearSession, setUser } = useSession();
  const isLoginRoute = to.path === "/auth/login";
  const { authMe } = useAuth();

  const hydrateUser = async () => {
    if (authUser.value) {
      return true;
    }

    try {
      const user = await authMe();
      setUser(user);
      return true;
    } catch {
      clearSession();
      return false;
    }
  };

  if (!isAuthenticated.value) {
    if (isLoginRoute) {
      return;
    }
    return navigateTo("/auth/login");
  }

  if (isLoginRoute) {
    const canUseSession = await hydrateUser();
    if (!canUseSession) {
      // Keep user on login when token is invalid/expired to avoid SSR redirect loops.
      if (to.query.reason !== "session_expired") {
        return navigateTo({
          path: "/auth/login",
          query: { reason: "session_expired" },
        });
      }
      return;
    }

    return navigateTo("/");
  }

  const canUseSession = await hydrateUser();
  if (!canUseSession) {
    return navigateTo({
      path: "/auth/login",
      query: { reason: "session_expired" },
    });
  }
});
