import { http } from './http'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  getStats: (month?: string) => http.get<DashboardStats>('/dashboard/stats', { params: { month } }),

  getAlerts: <T>() => http.get<T>('/notifications/alerts'),

  markAlertRead: (id: string) => http.patch(`/notifications/${id}/read`),

  markAllRead: () => http.patch('/notifications/read-all'),
}
