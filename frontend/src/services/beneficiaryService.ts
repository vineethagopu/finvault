import { http } from './http'
import type { Beneficiary, PaginationParams } from '@/types'

export const beneficiaryService = {
  getAll: (params?: PaginationParams) => http.get<Beneficiary[]>('/beneficiaries', { params }),

  getById: (id: string) => http.get<Beneficiary>(`/beneficiaries/${id}`),

  create: (data: Partial<Beneficiary>) => http.post<Beneficiary>('/beneficiaries', data),

  update: (id: string, data: Partial<Beneficiary>) => http.patch<Beneficiary>(`/beneficiaries/${id}`, data),

  delete: (id: string) => http.del(`/beneficiaries/${id}`),

  getSummary: <T>() => http.get<T>('/beneficiaries/summary'),
}
