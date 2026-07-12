import api from './api'
import type { Beneficiary, PaginationParams, ApiResponse } from '@/types'

export const beneficiaryService = {
  getAll: (params?: PaginationParams) =>
    api.get<ApiResponse<Beneficiary[]>>('/beneficiaries', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`),

  create: (data: Partial<Beneficiary>) =>
    api.post<ApiResponse<Beneficiary>>('/beneficiaries', data),

  update: (id: string, data: Partial<Beneficiary>) =>
    api.patch<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`, data),

  delete: (id: string) =>
    api.delete(`/beneficiaries/${id}`),

  getSummary: () =>
    api.get('/beneficiaries/summary'),
}
