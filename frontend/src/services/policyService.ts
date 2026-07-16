import { http } from './http'
import type { Policy, PolicyFilters, PaginationParams } from '@/types'

export const policyService = {
  getAll: (params?: PaginationParams & PolicyFilters) => http.get<Policy[]>('/policies', { params }),

  getById: (id: string) => http.get<Policy>(`/policies/${id}`),

  create: (data: Record<string, unknown>) => http.post<Policy>('/policies', data),

  update: (id: string, data: Partial<Policy>) => http.patch<Policy>(`/policies/${id}`, data),

  delete: (id: string) => http.del(`/policies/${id}`),

  getSummary: <T>() => http.get<T>('/policies/summary'),

  getAllDocuments: <T>() => http.get<T>('/policies/documents'),

  getDocuments: <T>(policyId: string) => http.get<T>(`/policies/${policyId}/documents`),

  getPayments: <T>(policyId: string) => http.get<T>(`/policies/${policyId}/payments`),

  addNominee: (policyId: string, data: Record<string, unknown>) =>
    http.post(`/policies/${policyId}/nominees`, data),

  updateNominee: (policyId: string, nomineeId: string, data: Record<string, unknown>) =>
    http.patch(`/policies/${policyId}/nominees/${nomineeId}`, data),

  removeNominee: (policyId: string, nomineeId: string) =>
    http.del(`/policies/${policyId}/nominees/${nomineeId}`),
}
