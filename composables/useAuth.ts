import type { AuthToken, User } from "@/misc/type";

const prefix = 'auth'

const authLogin = (data: { username: string, password: string, }): Promise<any> => preSecureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/login`, {
  method: "POST",
  body: JSON.stringify(data),
})

const register = async (data: { user: User, user_img?: File[], }) => {
  const formData = new FormData();
  formData.append("user", JSON.stringify(data.user));
  if (data.user_img && data.user_img.length > 0) {
    data.user_img?.forEach((file, index) => {
      formData.append(`user_img_${index}`, file);
    });
  }
  return await secureFetch(
    `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/register`, {
    method: "POST",
    body: formData,
  })
}

const authLogout = (): Promise<any> => secureFetch(`${useRuntimeConfig().public.apiBaseUrl}/${prefix}/logout`, { method: "POST", })

const sendOTP = (data: { email: string }): Promise<any> => preSecureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/sendOTP`, {
  method: "POST",
  body: JSON.stringify(data),
})

const confirmOTP = (data: { otp: string, user_id: string }): Promise<any> => preSecureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/confirmOTP`, {
  method: "POST",
  body: JSON.stringify(data),
})

const changePassword = (data: { new_password: string, user_id: string }): Promise<any> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/changePassword`, {
  method: "POST",
  body: JSON.stringify(data),
})

const refresh = (data: { refresh_token: string, }): Promise<AuthToken> => secureFetch(
  `${useRuntimeConfig().public.apiBaseUrl}/${prefix}/refresh`, {
  method: "POST",
  body: JSON.stringify(data),
})

export default function useAuth() {
  return {
    authLogin,
    register,
    authLogout,
    sendOTP,
    confirmOTP,
    changePassword,
    refresh,
  };
}