import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { API_BASE_URL } from '@/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // HttpOnly cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor – attach CSRF token if available
api.interceptors.request.use((config) => {
  const csrf = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
  if (csrf) config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrf)
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(null)))
  failedQueue = []
}

// Response interceptor – handle 401 with refresh token rotation
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest!))
      }

      originalRequest!._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        processQueue(null)
        return api(originalRequest!)
      } catch (refreshError) {
        processQueue(refreshError)
        // Session is unrecoverable: clear persisted auth so route guards
        // don't bounce back, and redirect only if not already on /login.
        sessionStorage.removeItem('pn-auth')
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
