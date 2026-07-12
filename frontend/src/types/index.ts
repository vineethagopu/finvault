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

// ─── Policy / Insurance ──────────────────────────────────────────────────────
export type InsuranceType =
  | 'LIFE' | 'HEALTH' | 'VEHICLE' | 'TRAVEL' | 'HOME' | 'PET' | 'FIRE' | 'OTHER'

export type PolicyStatus = 'ACTIVE' | 'LAPSED' | 'EXPIRED' | 'PENDING' | 'CANCELLED'

export interface Policy {
  id: string
  policyName: string
  policyNumber: string
  insuranceType: InsuranceType
  insuranceProvider: string
  providerLogo?: string
  planType: string
  sumInsured: number
  annualPremium: number
  paymentFrequency: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
  policyStartDate: string
  policyEndDate: string
  policyMaturityDate?: string
  policyTerm: number
  premiumPaymentTerm: number
  nextPremiumDueDate: string
  status: PolicyStatus
  policyholder: string
  notes?: string
  createdAt: string
  nominees?: Nominee[]
  documents?: Document[]
}

export interface PolicyFilters {
  type?: InsuranceType
  status?: PolicyStatus
  provider?: string
  search?: string
}

// ─── Investments ─────────────────────────────────────────────────────────────
export type InvestmentType =
  | 'MUTUAL_FUND' | 'STOCKS' | 'FIXED_DEPOSIT' | 'PPF_EPF' | 'BONDS' | 'GOLD_ETF' | 'REAL_ESTATE' | 'ULIP' | 'OTHER'

export interface Investment {
  id: string
  investmentName: string
  investmentType: InvestmentType
  provider: string
  schemeCode?: string
  folioNumber?: string
  amountInvested: number
  currentValue: number
  returnAmount: number
  returnPercent: number
  status: 'ACTIVE' | 'REDEEMED' | 'MATURED'
  investmentDate: string
  assetClass: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  lockInPeriod?: string
  expectedReturnRate?: number
  notes?: string
  createdAt: string
}

// ─── Loans ───────────────────────────────────────────────────────────────────
export type LoanType =
  | 'HOME' | 'PERSONAL' | 'VEHICLE' | 'EDUCATION' | 'BUSINESS' | 'POLICY' | 'GOLD' | 'OTHER'

export interface Loan {
  id: string
  loanAccountNumber: string
  loanType: LoanType
  loanProvider: string
  loanAmount: number
  outstandingAmount: number
  interestRate: number
  interestType: 'FIXED' | 'REDUCING'
  emiAmount: number
  emiDayOfMonth: number
  repaymentFrequency: 'MONTHLY' | 'QUARTERLY'
  loanStartDate: string
  loanMaturityDate: string
  loanTenure: number
  totalEMIs: number
  emisPaid: number
  emisRemaining: number
  nextEMIDate: string
  status: 'ACTIVE' | 'CLOSED' | 'OVERDUE'
  loanPurpose?: string
  collateralType?: string
  notes?: string
  createdAt: string
}

// ─── Documents ───────────────────────────────────────────────────────────────
export type DocumentCategory = 'POLICY' | 'LOAN' | 'INVESTMENT' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'FINANCIAL' | 'OTHER'
export type DocumentType = string

export interface Document {
  id: string
  documentName: string
  category: DocumentCategory
  documentType: DocumentType
  fileUrl: string
  fileSize: number
  fileType: string
  linkedTo?: string
  uploadedOn: string
  notes?: string
}

// ─── Beneficiaries ───────────────────────────────────────────────────────────
export type BeneficiaryType = 'NOMINEE' | 'SHAREHOLDER' | 'ACCOUNT_HOLDER' | 'OTHER'
export type Relationship =
  | 'SPOUSE' | 'FATHER' | 'MOTHER' | 'SON' | 'DAUGHTER' | 'BROTHER' | 'SISTER' | 'FRIEND' | 'OTHER'

export interface Beneficiary {
  id: string
  fullName: string
  relationship: Relationship
  dateOfBirth: string
  email?: string
  mobile: string
  pan?: string
  address?: string
  city?: string
  pinCode?: string
  sharePercentage: number
  fixedAmount?: number
  beneficiaryType: BeneficiaryType
  guardianName?: string
  linkedPolicy?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

// ─── Nominees ────────────────────────────────────────────────────────────────
export interface Nominee {
  id: string
  nomineeName: string
  relationship: Relationship
  dateOfBirth: string
  sharePercentage: number
  nomineeType: 'PRIMARY' | 'CONTINGENT'
  guardianName?: string
  policyId: string
  policyName: string
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
