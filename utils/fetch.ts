import Swal from 'sweetalert2'
import type { FetchOptions } from "@/misc/type"

export const preSecureFetch = (url: string, options: FetchOptions): Promise<any> =>
  $fetch(url, options)
    .then(responseInterceptor)
    .catch(e => errorInterceptor(e, options))

export const secureFetch = async (url: string, options: FetchOptions): Promise<any> => {
  options.headers = {
    ...options.headers,
    ...useAuthorizationHeader(),
  }

  return await $fetch(url, options)
    .then(responseInterceptor)
    .catch(e => errorInterceptor(e, options))
}

function useAuthorizationHeader(): any {
  const token = useCookie('Authorization')
  if (token.value) {
    return {
      Authorization: `Bearer ${token.value}`,
    }
  } else {
    return {}
  }
}

export const responseInterceptor = (response: any): Promise<any> => {
  return Promise.resolve(response)
}

export const errorInterceptor = async (error: any, options: any): Promise<any> => {
  if (error?.response) {
    const { status, statusText, _data } = error.response

    if (status === 401 && _data.message === 'Invalid token') {
      useCookie('x-access-token').value = null

      await Swal.fire({
        title: 'หมดเวลาเข้าสู่ระบบ',
        text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      })

      window.location.href = '/login'

      return Promise.reject(new Error('Token expired'))
    }

    Swal.fire({
      title: 'Request failed',
      text: _data.message || `${status} ${statusText}`,
      icon: "error",
    })
  } else {
    Swal.fire({
      title: 'Unable to connect',
      text: 'Network or Server error',
      icon: "error",
    })
  }

  return Promise.reject(error)
}
