import axios, { AxiosInstance } from 'axios'
import { API_BASE_URL } from '@/lib/config/appConfig'

export function createUploadAxios(tag: string): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 300000, // 5 minutes (300 seconds) for video upload and heavy AI processing tasks
  })

  // Request logging
  instance.interceptors.request.use(
    (config) => {
      // Keep logs lightweight; avoid dumping large payloads
      console.log(`${tag} Request:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        hasAuth: !!(config.headers as any)?.Authorization,
        timeout: config.timeout,
      })
      return config
    },
    (error) => {
      console.error(`${tag} Request Error:`, error)
      return Promise.reject(error)
    }
  )

  // Response logging
  instance.interceptors.response.use(
    (response) => {
      console.log(`${tag} Response:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        dataKeys: Object.keys(response.data || {}),
      })
      return response
    },
    (error) => {
      console.error(`${tag} Response Error:`, {
        isAxiosError: axios.isAxiosError(error),
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        data: error?.response?.data,
      })
      return Promise.reject(error)
    }
  )

  return instance
}
