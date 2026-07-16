import api from './api'
import type { Document, PaginationParams, ApiResponse } from '@/types'

export const documentService = {
  getAll: (params?: PaginationParams & { category?: string }) =>
    api.get<ApiResponse<Document[]>>('/documents', { params }),

  upload: (file: File, metadata: {
    name?: string; category?: string; tags?: string
    policyId?: string; loanId?: string; docType?: string
  }) => {
    const form = new FormData()
    form.append('file', file)
    Object.entries(metadata).forEach(([k, v]) => v && form.append(k, String(v)))
    return api.post<ApiResponse<Document>>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),
}
