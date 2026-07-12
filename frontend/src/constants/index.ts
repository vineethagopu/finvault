export const APP_NAME = 'PolicyNext'
export const APP_TAGLINE = 'Secure Today. Better Tomorrow.'
export const APP_DESCRIPTION = 'Your All-in-One Platform for Insurance, Investments & Loans'

export const SUPPORT_EMAIL = 'support@policynext.com'
export const SUPPORT_PHONE = '+91 98765 43210'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const INSURANCE_TYPES = [
  { value: 'LIFE', label: 'Life Insurance', color: '#16a34a', icon: '🛡️' },
  { value: 'HEALTH', label: 'Health Insurance', color: '#e11d48', icon: '❤️' },
  { value: 'VEHICLE', label: 'Vehicle Insurance', color: '#2563eb', icon: '🚗' },
  { value: 'TRAVEL', label: 'Travel Insurance', color: '#7c3aed', icon: '✈️' },
  { value: 'HOME', label: 'Home Insurance', color: '#d97706', icon: '🏠' },
  { value: 'PET', label: 'Pet Insurance', color: '#ec4899', icon: '🐾' },
  { value: 'FIRE', label: 'Fire Insurance', color: '#f97316', icon: '🔥' },
  { value: 'OTHER', label: 'Other Insurance', color: '#64748b', icon: '📋' },
]

export const INVESTMENT_TYPES = [
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'STOCKS', label: 'Stocks / Equity' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposits' },
  { value: 'PPF_EPF', label: 'PPF / EPF' },
  { value: 'BONDS', label: 'Bonds / Debentures' },
  { value: 'GOLD_ETF', label: 'Gold / ETF' },
  { value: 'REAL_ESTATE', label: 'Real Estate (REIT)' },
  { value: 'ULIP', label: 'ULIP' },
  { value: 'OTHER', label: 'Others' },
]

export const LOAN_TYPES = [
  { value: 'HOME', label: 'Home Loan' },
  { value: 'PERSONAL', label: 'Personal Loan' },
  { value: 'VEHICLE', label: 'Car / Vehicle Loan' },
  { value: 'EDUCATION', label: 'Education Loan' },
  { value: 'BUSINESS', label: 'Business Loan' },
  { value: 'POLICY', label: 'Policy Loan' },
  { value: 'GOLD', label: 'Gold Loan' },
  { value: 'OTHER', label: 'Others' },
]

export const RELATIONSHIPS = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'SON', label: 'Son' },
  { value: 'DAUGHTER', label: 'Daughter' },
  { value: 'BROTHER', label: 'Brother' },
  { value: 'SISTER', label: 'Sister' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'OTHER', label: 'Other' },
]

export const PAYMENT_FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
]

export const DOCUMENT_CATEGORIES = [
  { value: 'POLICY', label: 'Policy Document', color: '#16a34a' },
  { value: 'LOAN', label: 'Loan Document', color: '#f97316' },
  { value: 'INVESTMENT', label: 'Investment Document', color: '#2563eb' },
  { value: 'ID_PROOF', label: 'ID Proof', color: '#7c3aed' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof', color: '#0891b2' },
  { value: 'FINANCIAL', label: 'Financial Statement', color: '#d97706' },
  { value: 'OTHER', label: 'Other Document', color: '#64748b' },
]

export const RISK_LEVELS = [
  { value: 'LOW', label: 'Low Risk', color: '#16a34a' },
  { value: 'MEDIUM', label: 'Medium Risk', color: '#d97706' },
  { value: 'HIGH', label: 'High Risk', color: '#dc2626' },
]

export const ASSET_CLASSES = [
  { value: 'EQUITY', label: 'Equity' },
  { value: 'DEBT', label: 'Debt' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'COMMODITY', label: 'Commodity' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'CASH', label: 'Cash / Liquid' },
]

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Plan', path: '/app/my-plan', icon: 'Shield' },
  { label: 'Insurance', path: '/app/insurance', icon: 'ShieldCheck' },
  { label: 'Investments', path: '/app/investments', icon: 'TrendingUp' },
  { label: 'Loans', path: '/app/loans', icon: 'Banknote' },
  { label: 'Documents', path: '/app/documents', icon: 'FolderOpen' },
  { label: 'Beneficiaries', path: '/app/beneficiaries', icon: 'Users' },
  { label: 'Profile & Settings', path: '/app/profile', icon: 'Settings' },
  { label: 'Reports', path: '/app/reports', icon: 'BarChart3', badge: 'NEW' },
  { label: 'Alerts & Messages', path: '/app/alerts', icon: 'Bell' },
]

export const PUBLIC_NAV = [
  { label: 'Features', path: '/#features' },
  { label: 'How It Works', path: '/#how-it-works' },
  { label: 'About Us', path: '/#about' },
  { label: 'Pricing', path: '/#pricing' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: '#dcfce7', text: '#15803d', label: 'Active' },
  LAPSED: { bg: '#fee2e2', text: '#991b1b', label: 'Lapsed' },
  EXPIRED: { bg: '#f1f5f9', text: '#64748b', label: 'Expired' },
  PENDING: { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
  OVERDUE: { bg: '#fee2e2', text: '#991b1b', label: 'Overdue' },
  'DUE-SOON': { bg: '#fff7ed', text: '#c2410c', label: 'Due Soon' },
  UPCOMING: { bg: '#eff6ff', text: '#1d4ed8', label: 'Upcoming' },
  FUTURE: { bg: '#f1f5f9', text: '#64748b', label: 'Future' },
}
