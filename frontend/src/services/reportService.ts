import { http } from './http'

export const reportService = {
  getSummary: <T>() => http.get<T>('/reports/summary'),
  getNetWorthTrend: <T>() => http.get<T>('/reports/net-worth-trend'),
  getPremiumTrend: <T>() => http.get<T>('/reports/premium-trend'),
  getTaxSummary: <T>() => http.get<T>('/reports/tax-summary'),
}
