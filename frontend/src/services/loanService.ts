import api from './api'
import type { Loan, PaginationParams, ApiResponse } from '@/types'

export const loanService = {
  getAll: (params?: PaginationParams) =>
    api.get<ApiResponse<Loan[]>>('/loans', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Loan>>(`/loans/${id}`),

  create: (data: Partial<Loan>) =>
    api.post<ApiResponse<Loan>>('/loans', data),

  update: (id: string, data: Partial<Loan>) =>
    api.patch<ApiResponse<Loan>>(`/loans/${id}`, data),

  delete: (id: string) =>
    api.delete(`/loans/${id}`),

  getEligibility: () =>
    api.get('/loans/eligibility'),

  getDocuments: (id: string) =>
    api.get(`/loans/${id}/documents`),

  getTransactions: (id: string) =>
    api.get(`/loans/${id}/transactions`),
}
