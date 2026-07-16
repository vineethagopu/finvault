import api from './api'

export const reportService = {
  getSummary: () => api.get('/reports/summary'),
  getNetWorthTrend: () => api.get('/reports/net-worth-trend'),
  getPremiumTrend: () => api.get('/reports/premium-trend'),
  getTaxSummary: () => api.get('/reports/tax-summary'),
}
