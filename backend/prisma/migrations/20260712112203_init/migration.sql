-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('INDIVIDUAL', 'FAMILY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL', 'MOBILE', 'TWO_FA');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('LIFE', 'HEALTH', 'VEHICLE', 'TRAVEL', 'HOME', 'FIRE', 'MARINE', 'CROP', 'OTHER');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'LAPSED', 'CANCELLED', 'PENDING', 'CLAIMED');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('MUTUAL_FUND', 'STOCKS', 'FIXED_DEPOSIT', 'BONDS', 'GOLD_ETF', 'ULIP', 'PPF', 'NPS', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetClass" AS ENUM ('EQUITY', 'DEBT', 'HYBRID', 'COMMODITY', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('HOME_LOAN', 'CAR_LOAN', 'PERSONAL_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'CLOSED', 'OVERDUE', 'SETTLED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('INSURANCE', 'INVESTMENT', 'LOAN', 'KYC', 'INCOME', 'TAX', 'OTHER');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('NOMINEE', 'LEGAL_HEIR', 'ASSIGNEE');

-- CreateEnum
CREATE TYPE "PremiumStatus" AS ENUM ('UPCOMING', 'PAID', 'OVERDUE', 'MISSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'INFO', 'SUCCESS', 'INVESTMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('INSURANCE', 'INVESTMENT', 'LOAN', 'ACCOUNT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "occupation" TEXT,
    "annualIncome" DECIMAL(15,2),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "planType" "PlanType" NOT NULL DEFAULT 'INDIVIDUAL',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFASecret" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "OtpType" NOT NULL,
    "code" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMembership" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "relationship" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "policyNumber" TEXT,
    "insuranceType" "InsuranceType" NOT NULL,
    "provider" TEXT NOT NULL,
    "sumAssured" DECIMAL(15,2) NOT NULL,
    "premiumAmount" DECIMAL(10,2) NOT NULL,
    "premiumFrequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "policyStartDate" TIMESTAMP(3) NOT NULL,
    "policyEndDate" TIMESTAMP(3) NOT NULL,
    "nextPremiumDate" TIMESTAMP(3),
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "policyTerm" INTEGER,
    "agentName" TEXT,
    "agentContact" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nominee" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sharePercent" DECIMAL(5,2) NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nominee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumPayment" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PremiumStatus" NOT NULL DEFAULT 'UPCOMING',
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investmentName" TEXT NOT NULL,
    "investmentType" "InvestmentType" NOT NULL,
    "provider" TEXT NOT NULL,
    "assetClass" "AssetClass" NOT NULL DEFAULT 'EQUITY',
    "riskLevel" TEXT NOT NULL DEFAULT 'MODERATE',
    "amountInvested" DECIMAL(15,2) NOT NULL,
    "currentValue" DECIMAL(15,2) NOT NULL,
    "units" DECIMAL(15,4),
    "nav" DECIMAL(10,4),
    "folioNumber" TEXT,
    "investmentDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3),
    "returnPercent" DECIMAL(8,2),
    "returnAmount" DECIMAL(15,2),
    "sipAmount" DECIMAL(10,2),
    "sipDay" INTEGER,
    "isSip" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanName" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "lender" TEXT NOT NULL,
    "accountNumber" TEXT,
    "principalAmount" DECIMAL(15,2) NOT NULL,
    "outstandingAmount" DECIMAL(15,2) NOT NULL,
    "emiAmount" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "tenure" INTEGER NOT NULL,
    "remainingTenure" INTEGER NOT NULL,
    "emiDay" INTEGER NOT NULL,
    "nextEmiDate" TIMESTAMP(3),
    "disbursedDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmiPayment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "principal" DECIMAL(10,2),
    "interest" DECIMAL(10,2),
    "status" "PremiumStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmiPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "linkedType" TEXT,
    "linkedId" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT true,
    "scanStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyDocument" (
    "policyId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "docType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("policyId","documentId")
);

-- CreateTable
CREATE TABLE "LoanDocument" (
    "loanId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "docType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanDocument_pkey" PRIMARY KEY ("loanId","documentId")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "sharePercent" DECIMAL(5,2) NOT NULL,
    "aadhaarNumber" TEXT,
    "type" "BeneficiaryType" NOT NULL DEFAULT 'NOMINEE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycVerifiedAt" TIMESTAMP(3),
    "aadhaarLinked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "category" "AlertCategory" NOT NULL DEFAULT 'ACCOUNT',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_mobile_idx" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Otp_identifier_type_idx" ON "Otp"("identifier", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Family_ownerId_key" ON "Family"("ownerId");

-- CreateIndex
CREATE INDEX "FamilyMembership_userId_idx" ON "FamilyMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMembership_familyId_userId_key" ON "FamilyMembership"("familyId", "userId");

-- CreateIndex
CREATE INDEX "Policy_userId_idx" ON "Policy"("userId");

-- CreateIndex
CREATE INDEX "Policy_userId_status_idx" ON "Policy"("userId", "status");

-- CreateIndex
CREATE INDEX "Policy_nextPremiumDate_idx" ON "Policy"("nextPremiumDate");

-- CreateIndex
CREATE INDEX "Nominee_policyId_idx" ON "Nominee"("policyId");

-- CreateIndex
CREATE INDEX "PremiumPayment_policyId_idx" ON "PremiumPayment"("policyId");

-- CreateIndex
CREATE INDEX "PremiumPayment_dueDate_idx" ON "PremiumPayment"("dueDate");

-- CreateIndex
CREATE INDEX "PremiumPayment_status_idx" ON "PremiumPayment"("status");

-- CreateIndex
CREATE INDEX "Investment_userId_idx" ON "Investment"("userId");

-- CreateIndex
CREATE INDEX "Investment_userId_investmentType_idx" ON "Investment"("userId", "investmentType");

-- CreateIndex
CREATE INDEX "Loan_userId_idx" ON "Loan"("userId");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");

-- CreateIndex
CREATE INDEX "Loan_nextEmiDate_idx" ON "Loan"("nextEmiDate");

-- CreateIndex
CREATE INDEX "EmiPayment_loanId_idx" ON "EmiPayment"("loanId");

-- CreateIndex
CREATE INDEX "EmiPayment_dueDate_idx" ON "EmiPayment"("dueDate");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_userId_category_idx" ON "Document"("userId", "category");

-- CreateIndex
CREATE INDEX "Beneficiary_userId_idx" ON "Beneficiary"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembership" ADD CONSTRAINT "FamilyMembership_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembership" ADD CONSTRAINT "FamilyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nominee" ADD CONSTRAINT "Nominee_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumPayment" ADD CONSTRAINT "PremiumPayment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmiPayment" ADD CONSTRAINT "EmiPayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDocument" ADD CONSTRAINT "LoanDocument_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanDocument" ADD CONSTRAINT "LoanDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
