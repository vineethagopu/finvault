-- AlterEnum
ALTER TYPE "LoanType" ADD VALUE 'POLICY_LOAN';

-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "policyId" TEXT;

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "securedByPolicyId" TEXT;

-- AlterTable
ALTER TABLE "Nominee" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "planName" TEXT;

-- CreateTable
CREATE TABLE "InvestmentSnapshot" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorthSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assets" DECIMAL(15,2) NOT NULL,
    "liabilities" DECIMAL(15,2) NOT NULL,
    "netWorth" DECIMAL(15,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "userId" TEXT NOT NULL,
    "premiumDue" BOOLEAN NOT NULL DEFAULT true,
    "emiDue" BOOLEAN NOT NULL DEFAULT true,
    "policyExpiry" BOOLEAN NOT NULL DEFAULT true,
    "investmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "monthlyReport" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT false,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestmentSnapshot_investmentId_recordedAt_idx" ON "InvestmentSnapshot"("investmentId", "recordedAt");

-- CreateIndex
CREATE INDEX "InvestmentSnapshot_userId_recordedAt_idx" ON "InvestmentSnapshot"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "NetWorthSnapshot_userId_recordedAt_idx" ON "NetWorthSnapshot"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "CatalogItem_section_sortOrder_idx" ON "CatalogItem"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "Beneficiary_policyId_idx" ON "Beneficiary"("policyId");

-- CreateIndex
CREATE INDEX "Loan_securedByPolicyId_idx" ON "Loan"("securedByPolicyId");

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_securedByPolicyId_fkey" FOREIGN KEY ("securedByPolicyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentSnapshot" ADD CONSTRAINT "InvestmentSnapshot_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
