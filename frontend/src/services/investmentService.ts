import api from './api'
import type { Investment, PaginationParams, ApiResponse } from '@/types'

export const investmentService = {
  getAll: (params?: PaginationParams) =>
    api.get<ApiResponse<Investment[]>>('/investments', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Investment>>(`/investments/${id}`),

  create: (data: Partial<Investment>) =>
    api.post<ApiResponse<Investment>>('/investments', data),

  update: (id: string, data: Partial<Investment>) =>
    api.patch<ApiResponse<Investment>>(`/investments/${id}`, data),

  delete: (id: string) =>
    api.delete(`/investments/${id}`),

  getOverview: () =>
    api.get('/investments/overview'),

  getPerformance: () =>
    api.get('/investments/performance'),
}
