import api from './api'
import type { Policy, PolicyFilters, PaginationParams, ApiResponse } from '@/types'

export const policyService = {
  getAll: (params?: PaginationParams & PolicyFilters) =>
    api.get<ApiResponse<Policy[]>>('/policies', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Policy>>(`/policies/${id}`),

  create: (data: Partial<Omit<Policy, 'documents'>> & { documents?: File[] }) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'documents' && Array.isArray(v)) {
        ;(v as File[]).forEach((f) => form.append('documents', f))
      } else if (v !== undefined && v !== null) {
        form.append(k, String(v))
      }
    })
    return api.post<ApiResponse<Policy>>('/policies', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update: (id: string, data: Partial<Policy>) =>
    api.patch<ApiResponse<Policy>>(`/policies/${id}`, data),

  delete: (id: string) =>
    api.delete(`/policies/${id}`),

  getSummary: () =>
    api.get('/policies/summary'),

  getDuePremiums: (month?: string) =>
    api.get('/policies/due-premiums', { params: { month } }),
}
