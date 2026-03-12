import type { AuthToken, User } from "@/misc/type";

const prefix = "auth";

const authLogin = (data: { username: string; password: string }): Promise<AuthToken & { user: User }> =>
  preSecureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

const authMe = (): Promise<User> =>
  secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/me`, {
    method: "GET",
  });

const authLogout = (): Promise<any> => {
  const { refreshToken } = useSession();
  if (!refreshToken.value) {
    return Promise.resolve({ message: "No refresh token to revoke" });
  }

  return preSecureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/logout`, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken.value }),
  });
};

const refresh = (): Promise<AuthToken & { user?: User }> => {
  const { refreshToken } = useSession();
  return preSecureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/refresh`, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken.value }),
  });
};

export default function useAuth() {
  return {
    authLogin,
    authMe,
    authLogout,
    refresh,
  };
}
