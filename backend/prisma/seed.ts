import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })
}

// Mirrors InvestOnlinePage's SECTIONS exactly — this is the seed for CatalogItem,
// the backend-managed replacement for that hardcoded array.
const CATALOG: { section: string; iconKey: string; title: string }[] = [
  { section: 'Term Life Insurance', iconKey: 'Gift', title: 'Free of Cost Term Life Insurance' },
  { section: 'Term Life Insurance', iconKey: 'RefreshCw', title: 'Term Plans with Return of Premium' },
  { section: 'Term Life Insurance', iconKey: 'UserRound', title: 'Term Insurance (Women)' },
  { section: 'Term Life Insurance', iconKey: 'Briefcase', title: 'Term Life Insurance (Self Employed)' },
  { section: 'Term Life Insurance', iconKey: 'Globe', title: 'Term Life Insurance (NRIs)' },
  { section: 'Term Life Insurance', iconKey: 'Home', title: 'Home Loan Insurance' },
  { section: 'Health Insurance', iconKey: 'HeartPulse', title: 'Health' },
  { section: 'Health Insurance', iconKey: 'Users', title: 'Family Health Insurance' },
  { section: 'Health Insurance', iconKey: 'Shield', title: '1 Cr health Cover' },
  { section: 'Health Insurance', iconKey: 'Stethoscope', title: 'OPD' },
  { section: 'Health Insurance', iconKey: 'Leaf', title: 'Arogya Sanjeevani...' },
  { section: 'Health Insurance', iconKey: 'Ribbon', title: 'Cancer Insurance' },
  { section: 'Investment Plans', iconKey: 'Baby', title: 'Child Savings P...' },
  { section: 'Investment Plans', iconKey: 'IndianRupee', title: 'Guaranteed Return Pla...' },
  { section: 'Investment Plans', iconKey: 'Users', title: 'Retirement Plan' },
  { section: 'Investment Plans', iconKey: 'ReceiptText', title: 'Tax Saving Investment' },
  { section: 'Investment Plans', iconKey: 'HandCoins', title: 'Pension For Life' },
  { section: 'Investment Plans', iconKey: 'PiggyBank', title: 'Smart Deposit' },
  { section: 'Investment Plans', iconKey: 'Umbrella', title: 'ULIPs' },
  { section: 'Investment Plans', iconKey: 'CircleDollarSign', title: 'Dollar Based Product' },
  { section: 'Other Plans', iconKey: 'Bike', title: '2 Wheeler Insurance' },
  { section: 'Other Plans', iconKey: 'Plane', title: 'Travel Insurance' },
  { section: 'Buy Investments Online', iconKey: 'BarChart3', title: 'Stocks' },
  { section: 'Buy Investments Online', iconKey: 'Users', title: 'Mutual Funds' },
  { section: 'Buy Investments Online', iconKey: 'Coins', title: 'Gold Bonds' },
]

async function main() {
  const passwordHash = await hashPassword('Rajat@123')

  const user = await prisma.user.upsert({
    where: { username: 'rajat.sharma' },
    update: {},
    create: {
      username: 'rajat.sharma',
      email: 'rajat.sharma@example.com',
      mobile: '9876543210',
      passwordHash,
      firstName: 'Rajat',
      lastName: 'Sharma',
      planType: 'INDIVIDUAL',
      emailVerified: true,
      mobileVerified: true,
    },
  })

  const lifePolicy = await prisma.policy.upsert({
    where: { id: `${user.id}-seed-policy-life` },
    update: {},
    create: {
      id: `${user.id}-seed-policy-life`,
      userId: user.id,
      policyName: 'Family Life Shield',
      policyNumber: 'POL-2024-000123',
      planName: 'Term Plan',
      insuranceType: 'LIFE',
      provider: 'LIC of India',
      sumAssured: 5000000,
      premiumAmount: 24000,
      premiumFrequency: 'ANNUAL',
      policyStartDate: new Date('2024-01-15'),
      policyEndDate: new Date('2044-01-15'),
      nextPremiumDate: new Date('2027-01-15'),
      status: 'ACTIVE',
      policyTerm: 20,
    },
  })

  const healthPolicy = await prisma.policy.upsert({
    where: { id: `${user.id}-seed-policy-health` },
    update: {},
    create: {
      id: `${user.id}-seed-policy-health`,
      userId: user.id,
      policyName: 'Family Health Cover',
      policyNumber: 'POL-2024-000456',
      planName: 'Family Floater',
      insuranceType: 'HEALTH',
      provider: 'Star Health Insurance',
      sumAssured: 1000000,
      premiumAmount: 18000,
      premiumFrequency: 'ANNUAL',
      policyStartDate: new Date('2024-03-01'),
      policyEndDate: new Date('2025-02-28'),
      nextPremiumDate: new Date('2027-03-01'),
      status: 'ACTIVE',
      policyTerm: 1,
    },
  })

  await prisma.nominee.upsert({
    where: { id: `${lifePolicy.id}-nominee` },
    update: {},
    create: {
      id: `${lifePolicy.id}-nominee`,
      policyId: lifePolicy.id,
      fullName: 'Priya Sharma',
      relationship: 'Spouse',
      sharePercent: 100,
      mobile: '9876500000',
      email: 'priya.sharma@example.com',
    },
  })

  await prisma.premiumPayment.upsert({
    where: { id: `${lifePolicy.id}-payment-1` },
    update: {},
    create: {
      id: `${lifePolicy.id}-payment-1`,
      policyId: lifePolicy.id,
      dueDate: new Date('2026-01-15'),
      paidDate: new Date('2026-01-14'),
      amount: 24000,
      status: 'PAID',
    },
  })
  await prisma.premiumPayment.upsert({
    where: { id: `${lifePolicy.id}-payment-2` },
    update: {},
    create: {
      id: `${lifePolicy.id}-payment-2`,
      policyId: lifePolicy.id,
      dueDate: new Date('2027-01-15'),
      amount: 24000,
      status: 'UPCOMING',
    },
  })

  const investment = await prisma.investment.upsert({
    where: { id: `${user.id}-seed-investment` },
    update: {},
    create: {
      id: `${user.id}-seed-investment`,
      userId: user.id,
      investmentName: 'Axis Bluechip Fund',
      investmentType: 'MUTUAL_FUND',
      provider: 'Axis Mutual Fund',
      assetClass: 'EQUITY',
      amountInvested: 100000,
      currentValue: 118500,
      isSip: true,
      sipAmount: 5000,
      sipDay: 5,
      investmentDate: new Date('2023-06-01'),
      status: 'ACTIVE',
    },
  })

  // A few historical points so the performance chart has real (if sparse) data from day one.
  const snapshotPoints: [string, number][] = [
    ['2025-10-01', 105000], ['2025-11-01', 109500], ['2025-12-01', 112000],
    ['2026-01-01', 114800], ['2026-02-01', 116200], ['2026-03-01', 118500],
  ]
  for (const [date, value] of snapshotPoints) {
    await prisma.investmentSnapshot.upsert({
      where: { id: `${investment.id}-snap-${date}` },
      update: {},
      create: {
        id: `${investment.id}-snap-${date}`,
        investmentId: investment.id,
        userId: user.id,
        value,
        recordedAt: new Date(date),
      },
    })
  }

  const loan = await prisma.loan.upsert({
    where: { id: `${user.id}-seed-loan` },
    update: {},
    create: {
      id: `${user.id}-seed-loan`,
      userId: user.id,
      loanName: 'Home Loan',
      loanType: 'HOME_LOAN',
      lender: 'HDFC Bank',
      principalAmount: 3500000,
      outstandingAmount: 2800000,
      emiAmount: 32000,
      interestRate: 8.5,
      tenure: 240,
      remainingTenure: 190,
      emiDay: 5,
      disbursedDate: new Date('2020-03-01'),
      maturityDate: new Date('2040-03-01'),
      status: 'ACTIVE',
    },
  })

  await prisma.emiPayment.upsert({
    where: { id: `${loan.id}-emi-1` },
    update: {},
    create: {
      id: `${loan.id}-emi-1`,
      loanId: loan.id,
      dueDate: new Date('2026-06-05'),
      paidDate: new Date('2026-06-04'),
      amount: 32000,
      principal: 22000,
      interest: 10000,
      status: 'PAID',
    },
  })
  await prisma.emiPayment.upsert({
    where: { id: `${loan.id}-emi-2` },
    update: {},
    create: {
      id: `${loan.id}-emi-2`,
      loanId: loan.id,
      dueDate: new Date('2026-07-05'),
      amount: 32000,
      principal: 22150,
      interest: 9850,
      status: 'UPCOMING',
    },
  })

  // A small policy loan against the life policy, to exercise the loan-eligibility formula.
  await prisma.loan.upsert({
    where: { id: `${user.id}-seed-loan-policy` },
    update: {},
    create: {
      id: `${user.id}-seed-loan-policy`,
      userId: user.id,
      securedByPolicyId: lifePolicy.id,
      loanName: 'Policy Loan Against Family Life Shield',
      loanType: 'POLICY_LOAN',
      lender: 'LIC of India',
      principalAmount: 280000,
      outstandingAmount: 185750,
      emiAmount: 12750,
      interestRate: 9.25,
      tenure: 240,
      remainingTenure: 215,
      emiDay: 5,
      disbursedDate: new Date('2024-04-10'),
      maturityDate: new Date('2044-04-10'),
      status: 'ACTIVE',
    },
  })

  await prisma.beneficiary.upsert({
    where: { id: `${user.id}-seed-beneficiary` },
    update: { policyId: lifePolicy.id },
    create: {
      id: `${user.id}-seed-beneficiary`,
      userId: user.id,
      policyId: lifePolicy.id,
      fullName: 'Priya Sharma',
      relationship: 'Spouse',
      sharePercent: 100,
      mobile: '9876500000',
      email: 'priya.sharma@example.com',
      type: 'NOMINEE',
    },
  })

  await prisma.document.upsert({
    where: { id: `${user.id}-seed-document` },
    update: {},
    create: {
      id: `${user.id}-seed-document`,
      userId: user.id,
      name: 'Family Life Shield - Policy Schedule.pdf',
      fileName: 'policy-schedule.pdf',
      mimeType: 'application/pdf',
      size: 245678,
      s3Key: 'seed/policy-schedule.pdf',
      s3Bucket: 'local',
      category: 'INSURANCE',
      tags: ['policy', 'life-insurance'],
      isEncrypted: false,
      scanStatus: 'CLEAN',
      policyDocuments: {
        create: { policyId: lifePolicy.id, docType: 'Policy Document' },
      },
    },
  })

  await prisma.notification.upsert({
    where: { id: `${user.id}-seed-notification` },
    update: {},
    create: {
      id: `${user.id}-seed-notification`,
      userId: user.id,
      type: 'INFO',
      category: 'ACCOUNT',
      title: 'Welcome to PolicyNext',
      message: 'Your account is set up with sample data so you can explore the dashboard.',
    },
  })

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  })

  for (const [i, item] of CATALOG.entries()) {
    await prisma.catalogItem.upsert({
      where: { id: `catalog-${i}` },
      update: { section: item.section, title: item.title, iconKey: item.iconKey, sortOrder: i },
      create: { id: `catalog-${i}`, section: item.section, title: item.title, iconKey: item.iconKey, sortOrder: i },
    })
  }

  console.log('Seed complete. Demo login: rajat.sharma / Rajat@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
