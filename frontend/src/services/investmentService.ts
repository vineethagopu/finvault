import { http } from './http'
import type { Investment, PaginationParams } from '@/types'

export const investmentService = {
  getAll: (params?: PaginationParams) => http.get<Investment[]>('/investments', { params }),

  getById: (id: string) => http.get<Investment>(`/investments/${id}`),

  create: (data: Partial<Investment>) => http.post<Investment>('/investments', data),

  update: (id: string, data: Partial<Investment>) => http.patch<Investment>(`/investments/${id}`, data),

  delete: (id: string) => http.del(`/investments/${id}`),

  getOverview: <T>() => http.get<T>('/investments/overview'),

  getPerformance: <T>() => http.get<T>('/investments/performance'),
}
