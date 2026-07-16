-- AlterEnum
ALTER TYPE "BeneficiaryType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "pan" TEXT;
