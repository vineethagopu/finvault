import api from './api'
import type { Policy, PolicyFilters, PaginationParams, ApiResponse } from '@/types'

export const policyService = {
  getAll: (params?: PaginationParams & PolicyFilters) =>
    api.get<ApiResponse<Policy[]>>('/policies', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Policy>>(`/policies/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Policy>>('/policies', data),

  update: (id: string, data: Partial<Policy>) =>
    api.patch<ApiResponse<Policy>>(`/policies/${id}`, data),

  delete: (id: string) =>
    api.delete(`/policies/${id}`),

  getSummary: () =>
    api.get('/policies/summary'),

  getAllDocuments: () =>
    api.get('/policies/documents'),

  getDocuments: (policyId: string) =>
    api.get(`/policies/${policyId}/documents`),

  getPayments: (policyId: string) =>
    api.get(`/policies/${policyId}/payments`),

  addNominee: (policyId: string, data: Record<string, unknown>) =>
    api.post(`/policies/${policyId}/nominees`, data),

  updateNominee: (policyId: string, nomineeId: string, data: Record<string, unknown>) =>
    api.patch(`/policies/${policyId}/nominees/${nomineeId}`, data),

  removeNominee: (policyId: string, nomineeId: string) =>
    api.delete(`/policies/${policyId}/nominees/${nomineeId}`),
}
