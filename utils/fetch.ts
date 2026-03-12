import Swal from 'sweetalert2'
import type { FetchOptions } from "@/misc/type"
import useSession from "~/composables/useSession";

export const preSecureFetch = (url: string, options: FetchOptions): Promise<any> =>
  $fetch(url, options)
    .then(responseInterceptor)
    .catch(errorInterceptor)

export const secureFetch = async (url: string, options: FetchOptions): Promise<any> => {
  const requestOptions: FetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      ...useAuthorizationHeader(),
    },
  }

  return await $fetch(url, requestOptions)
    .then(responseInterceptor)
    .catch(async (error) => {
      if (shouldTryRefresh(error)) {
        const refreshed = await refreshSessionToken()
        if (refreshed) {
          const retryOptions: FetchOptions = {
            ...options,
            headers: {
              ...options.headers,
              ...useAuthorizationHeader(),
            },
          }

          return $fetch(url, retryOptions).then(responseInterceptor).catch(errorInterceptor)
        }

        await handleSessionExpired()
        return Promise.reject(new Error("Session expired"))
      }

      return errorInterceptor(error)
    })
}

function useAuthorizationHeader(): any {
  const { accessToken } = useSession()
  if (accessToken.value) {
    return {
      Authorization: `Bearer ${accessToken.value}`,
    }
  }

  return {}
}

export const responseInterceptor = (response: any): Promise<any> => {
  if (response && typeof response === "object" && "success" in response) {
    if (response.success === true) {
      return Promise.resolve(response.data)
    }

    const message = response?.error?.message || "Request failed"
    return Promise.reject(new Error(message))
  }

  return Promise.resolve(response)
}

export const errorInterceptor = async (error: any): Promise<any> => {
  if (error?.response) {
    const { status, statusText, _data } = error.response
    const message = _data?.error?.message || _data?.message || `${status} ${statusText}`

    if (process.client) {
      await Swal.fire({
        title: "Request failed",
        text: message,
        icon: "error",
      })
    }
  } else {
    if (process.client) {
      await Swal.fire({
        title: "Unable to connect",
        text: "Network or Server error",
        icon: "error",
      })
    }
  }

  return Promise.reject(error)
}

const shouldTryRefresh = (error: any) => {
  const status = error?.response?.status
  if (status !== 401) {
    return false
  }

  const errorCode = error?.response?._data?.error?.code
  return errorCode === "AUTH_TOKEN_INVALID" || errorCode === "AUTH_TOKEN_MISSING" || !errorCode
}

let refreshPromise: Promise<boolean> | null = null

const refreshSessionToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const { refreshToken, authUser, setSession } = useSession()
    if (!refreshToken.value) {
      return false
    }

    const url = `${useRuntimeConfig().public.apiBaseUrl}/auth/refresh`
    try {
      const response = await $fetch(url, {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken.value }),
      }).then(responseInterceptor)

      if (!response?.access_token || !response?.refresh_token) {
        return false
      }

      setSession({
        ...response,
        user: response?.user ?? authUser.value ?? null,
      })
      return true
    } catch {
      return false
    }
  })()

  const result = await refreshPromise
  refreshPromise = null
  return result
}

const handleSessionExpired = async () => {
  const { clearSession } = useSession()
  clearSession()

  if (process.client) {
    await Swal.fire({
      title: "Session expired",
      text: "Please login again.",
      icon: "warning",
      confirmButtonText: "OK",
    })
    window.location.href = "/auth/login"
  }
}
