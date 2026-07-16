import api from './api'

export const catalogService = {
  getAll: () => api.get('/catalog'),
}
