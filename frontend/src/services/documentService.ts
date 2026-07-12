import api from './api'
import type { Document, PaginationParams, ApiResponse } from '@/types'

export const documentService = {
  getAll: (params?: PaginationParams & { category?: string }) =>
    api.get<ApiResponse<Document[]>>('/documents', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Document>>(`/documents/${id}`),

  upload: (file: File, metadata: { category: string; documentType: string; linkedTo?: string; notes?: string }) => {
    const form = new FormData()
    form.append('file', file)
    Object.entries(metadata).forEach(([k, v]) => v && form.append(k, v))
    return api.post<ApiResponse<Document>>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getSignedUrl: (id: string) =>
    api.get<{ url: string }>(`/documents/${id}/signed-url`),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),

  getCategories: () =>
    api.get('/documents/categories'),
}
