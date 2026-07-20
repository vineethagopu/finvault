/**
 * Central registry of React Query cache keys.
 *
 * Every `useQuery`/`invalidateQueries` key in the app is defined here so keys
 * stay consistent and refactor-safe. Values mirror the keys the features
 * already used, so cache identity and prefix-based invalidation are unchanged
 * (e.g. invalidating `documents.all()` still matches every `documents.list(...)`).
 */
export const queryKeys = {
  policies: {
    list: () => ['policies'],
    lifeActive: () => ['policies-life-active'],
    detail: (id?: string) => ['policy', id],
    payments: (id?: string) => ['policy-payments', id],
    documents: (id?: string) => ['policy-documents', id],
    allDocuments: () => ['policy-documents-all'],
  },
  loans: {
    list: () => ['loans'],
    eligibility: () => ['loans-eligibility'],
    detail: (id?: string) => ['loan', id],
    transactions: (id?: string) => ['loan-transactions', id],
    documents: (id?: string) => ['loan-documents', id],
  },
  investments: {
    list: () => ['investments'],
    overview: () => ['investments-overview'],
    performance: () => ['investments-performance'],
  },
  beneficiaries: {
    list: () => ['beneficiaries'],
    summary: () => ['beneficiaries-summary'],
  },
  dashboard: {
    all: () => ['dashboard-stats'],
    stats: (month?: string) => ['dashboard-stats', month],
  },
  documents: {
    all: () => ['documents'],
    list: (page: number, category: string, search: string) => ['documents', page, category, search],
  },
  notifications: {
    all: () => ['notifications'],
    list: (filter: string, unreadOnly: boolean) => ['notifications', filter, unreadOnly],
  },
  catalog: {
    list: () => ['catalog'],
  },
  reports: {
    summary: () => ['reports-summary'],
    netWorthTrend: () => ['reports-net-worth-trend'],
    premiumTrend: () => ['reports-premium-trend'],
    taxSummary: () => ['reports-tax-summary'],
  },
  profile: {
    me: () => ['profile'],
    sessions: () => ['sessions'],
    notificationPreferences: () => ['notification-preferences'],
  },
} as const
