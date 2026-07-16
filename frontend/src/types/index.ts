// ─── Auth ──────────────────────────────────────────────────────────────────
export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  mobile: string
  role: 'USER' | 'FAMILY_ADMIN' | 'ADMIN' | 'SUPER_ADMIN'
  planType: 'INDIVIDUAL' | 'FAMILY'
  planId: string
  planStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING'
  avatar?: string
  isEmailVerified: boolean
  isMobileVerified: boolean
  lastLogin?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface OtpLoginCredentials {
  username: string
  contactInfo: string
  otp?: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  username: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
  planType: 'INDIVIDUAL' | 'FAMILY'
  agreedToTerms: boolean
}

export interface FamilyMemberData {
  firstName: string
  lastName: string
  username: string
  email: string
  mobile: string
  password: string
  relationship?: string
}

// ─── Policy / Insurance ──────────────────────────────────────────────────────
// These mirror backend/prisma/schema.prisma + the Nest DTOs field-for-field —
// keep them in sync with the API response shape, not with any mock UI.
export type InsuranceType =
  | 'LIFE' | 'HEALTH' | 'VEHICLE' | 'TRAVEL' | 'HOME' | 'FIRE' | 'MARINE' | 'CROP' | 'OTHER'

export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'LAPSED' | 'CANCELLED' | 'PENDING' | 'CLAIMED'

export interface Nominee {
  id: string
  policyId: string
  fullName: string
  relationship: string
  dateOfBirth?: string
  sharePercent: number
  mobile?: string
  email?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface PremiumPayment {
  id: string
  policyId: string
  dueDate: string
  paidDate?: string
  amount: number
  status: 'UPCOMING' | 'PAID' | 'OVERDUE' | 'MISSED'
  receiptUrl?: string
}

export interface Policy {
  id: string
  policyName: string
  policyNumber?: string
  planName?: string
  insuranceType: InsuranceType
  provider: string
  sumAssured: number
  premiumAmount: number
  premiumFrequency: string
  policyStartDate: string
  policyEndDate: string
  nextPremiumDate?: string
  status: PolicyStatus
  policyTerm?: number
  agentName?: string
  agentContact?: string
  notes?: string
  createdAt: string
  updatedAt: string
  nominees?: Nominee[]
  premiumPayments?: PremiumPayment[]
  _count?: { policyDocuments: number }
}

export interface PolicyFilters {
  insuranceType?: InsuranceType
  status?: PolicyStatus
  search?: string
}

// ─── Investments ─────────────────────────────────────────────────────────────
export type InvestmentType =
  | 'MUTUAL_FUND' | 'STOCKS' | 'FIXED_DEPOSIT' | 'BONDS' | 'GOLD_ETF' | 'ULIP' | 'PPF' | 'NPS' | 'REAL_ESTATE' | 'OTHER'

export type AssetClass = 'EQUITY' | 'DEBT' | 'HYBRID' | 'COMMODITY' | 'REAL_ESTATE' | 'OTHER'

export interface Investment {
  id: string
  investmentName: string
  investmentType: InvestmentType
  provider: string
  assetClass: AssetClass
  riskLevel: string
  amountInvested: number
  currentValue: number
  units?: number
  nav?: number
  folioNumber?: string
  investmentDate: string
  maturityDate?: string
  returnPercent?: number
  returnAmount?: number
  sipAmount?: number
  sipDay?: number
  isSip: boolean
  status: string
  notes?: string
  createdAt: string
}

export interface InvestmentSnapshot {
  id: string
  investmentId: string
  value: number
  recordedAt: string
}

// ─── Loans ───────────────────────────────────────────────────────────────────
export type LoanType =
  | 'HOME_LOAN' | 'CAR_LOAN' | 'PERSONAL_LOAN' | 'EDUCATION_LOAN' | 'BUSINESS_LOAN' | 'GOLD_LOAN' | 'POLICY_LOAN' | 'OTHER'

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'SETTLED'

export interface EmiPayment {
  id: string
  loanId: string
  dueDate: string
  paidDate?: string
  amount: number
  principal?: number
  interest?: number
  status: 'UPCOMING' | 'PAID' | 'OVERDUE' | 'MISSED'
}

export interface Loan {
  id: string
  loanName: string
  loanType: LoanType
  lender: string
  accountNumber?: string
  securedByPolicyId?: string
  principalAmount: number
  outstandingAmount: number
  emiAmount: number
  interestRate: number
  tenure: number
  remainingTenure: number
  emiDay: number
  nextEmiDate?: string
  disbursedDate: string
  maturityDate: string
  purpose?: string
  interestType?: string
  repaymentFrequency?: string
  securityType?: string
  status: LoanStatus
  createdAt: string
  emiPayments?: EmiPayment[]
}

// ─── Documents ───────────────────────────────────────────────────────────────
export type DocumentCategory = 'INSURANCE' | 'INVESTMENT' | 'LOAN' | 'KYC' | 'INCOME' | 'TAX' | 'OTHER'

export interface Document {
  id: string
  name: string
  mimeType: string
  size: number
  category: DocumentCategory
  tags: string[]
  scanStatus: string
  createdAt: string
  updatedAt: string
}

// ─── Beneficiaries ───────────────────────────────────────────────────────────
export type BeneficiaryType = 'NOMINEE' | 'LEGAL_HEIR' | 'ASSIGNEE' | 'OTHER'

export interface Beneficiary {
  id: string
  policyId?: string
  fullName: string
  relationship: string
  dateOfBirth?: string
  mobile?: string
  email?: string
  address?: string
  sharePercent: number
  aadhaarNumber?: string
  pan?: string
  type: BeneficiaryType
  isVerified: boolean
  createdAt: string
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export interface Alert {
  id: string
  title: string
  message: string
  type: 'PREMIUM_DUE' | 'POLICY_EXPIRED' | 'POLICY_EXPIRING' | 'EMI_DUE' | 'GENERAL' | 'SECURITY'
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  isRead: boolean
  createdAt: string
  linkedId?: string
  linkedType?: string
}

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  plan: {
    type: string
    planId: string
    status: string
    startDate: string
    expiryDate: string
    price: number
  }
  totalPolicies: number
  totalMonthlyCommitment: number
  insuranceSummary: {
    life: number
    vehicle: number
    travel: number
    home: number
    health: number
    pet: number
  }
  duePremiums: DuePremium[]
  investmentOverview: {
    total: number
    monthlyDue: number
    items: InvestmentDue[]
  }
  loanOverview: {
    total: number
    monthlyEmi: number
    items: LoanDue[]
  }
}

export interface DuePremium {
  id: string
  insurer: string
  insurerLogo?: string
  policyName: string
  dueDate: string
  amount: number
  status: string
}

export interface InvestmentDue {
  id: string
  company: string
  type: string
  dueDate: string
  amount: number
}

export interface LoanDue {
  id: string
  provider: string
  loanType: string
  dueDate: string
  emiAmount: number
}

// ─── Plan ─────────────────────────────────────────────────────────────────────
export type PlanType = 'INDIVIDUAL' | 'FAMILY'

export interface Plan {
  id: string
  type: PlanType
  name: string
  price: number
  features: string[]
  maxLogins: number
}
