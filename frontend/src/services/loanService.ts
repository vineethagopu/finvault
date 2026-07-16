import { http } from './http'
import type { Loan, PaginationParams } from '@/types'

export const loanService = {
  getAll: (params?: PaginationParams) => http.get<Loan[]>('/loans', { params }),

  getById: (id: string) => http.get<Loan>(`/loans/${id}`),

  create: (data: Partial<Loan>) => http.post<Loan>('/loans', data),

  update: (id: string, data: Partial<Loan>) => http.patch<Loan>(`/loans/${id}`, data),

  delete: (id: string) => http.del(`/loans/${id}`),

  getEligibility: <T>() => http.get<T>('/loans/eligibility'),

  getDocuments: <T>(id: string) => http.get<T>(`/loans/${id}/documents`),

  getTransactions: <T>(id: string) => http.get<T>(`/loans/${id}/transactions`),
}
