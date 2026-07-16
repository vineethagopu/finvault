import { http } from './http'

export const catalogService = {
  getAll: <T>() => http.get<T>('/catalog'),
}
