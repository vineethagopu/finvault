import api from './api'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  getStats: (month?: string) =>
    api.get<DashboardStats>('/dashboard/stats', { params: { month } }),

  getAlerts: () =>
    api.get('/notifications/alerts'),

  markAlertRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
}
