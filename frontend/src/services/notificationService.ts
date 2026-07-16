import { http } from './http'

export const notificationService = {
  /** Returns the raw list envelope; caller supplies the shape (`meta.unreadCount`). */
  getAll: <T>(params?: { category?: string; unreadOnly?: boolean; page?: number; limit?: number }) =>
    http.raw<T>('/notifications', { params }),

  markRead: (id: string) => http.patch(`/notifications/${id}/read`),

  markAllRead: () => http.patch('/notifications/read-all'),

  delete: (id: string) => http.del(`/notifications/${id}`),
}
