import { http } from './http'
import type { Document, PaginationParams } from '@/types'

export const documentService = {
  /**
   * Returns the raw list envelope; the caller supplies the response shape
   * because this endpoint's `meta` (counts by category, page totals) is
   * non-standard.
   */
  getAll: <T>(params?: PaginationParams & { category?: string }) =>
    http.raw<T>('/documents', { params }),

  upload: (file: File, metadata: {
    name?: string; category?: string; tags?: string
    policyId?: string; loanId?: string; docType?: string
  }) => {
    const form = new FormData()
    form.append('file', file)
    Object.entries(metadata).forEach(([k, v]) => v && form.append(k, String(v)))
    return http.post<Document>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  download: (id: string) => http.blob(`/documents/${id}/download`),

  delete: (id: string) => http.del(`/documents/${id}`),
}
