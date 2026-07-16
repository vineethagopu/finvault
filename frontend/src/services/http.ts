import type { AxiosRequestConfig } from 'axios'
import api from './api'
import type { ApiResponse } from '@/types'

/**
 * Transport seam over the raw axios `api` instance.
 *
 * Every backend response is wrapped by the server's ResponseInterceptor as
 * `{ success, data, message?, meta? }`. This module is the single place that
 * knows about that envelope contract, so feature services and hooks receive
 * clean domain data and never touch `res.data.data` themselves.
 *
 * Swapping the underlying transport (axios → fetch) or changing the envelope
 * shape is a one-file change here — nothing in `services/*Service.ts`, the
 * feature hooks, or the pages needs to change.
 */
export const http = {
  /** GET returning the unwrapped domain payload (`res.data.data`). */
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get<ApiResponse<T>>(url, config).then((r) => r.data.data),

  /**
   * GET returning the raw response body typed by the caller. Use for list
   * endpoints whose non-standard `meta` (pagination, counts) the caller needs,
   * e.g. `{ data, meta: { unreadCount } }`.
   */
  raw: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get<T>(url, config).then((r) => r.data),

  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.post<ApiResponse<T>>(url, body, config).then((r) => r.data.data),

  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.patch<ApiResponse<T>>(url, body, config).then((r) => r.data.data),

  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.put<ApiResponse<T>>(url, body, config).then((r) => r.data.data),

  del: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete<ApiResponse<T>>(url, config).then((r) => r.data?.data),

  /** GET a binary payload (file download); returns the raw Blob unenveloped. */
  blob: (url: string, config?: AxiosRequestConfig): Promise<Blob> =>
    api.get(url, { ...config, responseType: 'blob' }).then((r) => r.data),
}

export default http
