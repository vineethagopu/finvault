import api from './api'

export const notificationService = {
  getAll: (params?: { category?: string; unreadOnly?: boolean; page?: number; limit?: number }) =>
    api.get('/notifications', { params }),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
}
