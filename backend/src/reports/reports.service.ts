import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

function currentFinancialYear(): { start: Date; end: Date; label: string } {
  const now = new Date()
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1 // FY starts April (month index 3)
  const start = new Date(fyStartYear, 3, 1)
  const end = new Date(fyStartYear + 1, 3, 1)
  return { start, end, label: `FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}` }
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [policies, investments, loans] = await this.prisma.$transaction([
      this.prisma.policy.findMany({ where: { userId, status: 'ACTIVE' }, select: { sumAssured: true, insuranceType: true } }),
      this.prisma.investment.findMany({ where: { userId }, select: { currentValue: true } }),
      this.prisma.loan.findMany({ where: { userId, status: { in: ['ACTIVE', 'OVERDUE'] } }, select: { outstandingAmount: true } }),
    ])

    const totalInsuranceCoverage = policies.reduce((s, p) => s + Number(p.sumAssured), 0)
    const totalInvestmentValue = investments.reduce((s, i) => s + Number(i.currentValue), 0)
    const totalLoanOutstanding = loans.reduce((s, l) => s + Number(l.outstandingAmount), 0)

    const totalAssets = totalInsuranceCoverage + totalInvestmentValue
    const totalLiabilities = totalLoanOutstanding
    const netWorth = totalAssets - totalLiabilities

    const coverageByType = new Map<string, number>()
    for (const p of policies) {
      coverageByType.set(p.insuranceType, (coverageByType.get(p.insuranceType) ?? 0) + Number(p.sumAssured))
    }

    const { start } = currentFinancialYear()
    const premiumsPaidRows = await this.prisma.premiumPayment.findMany({
      where: { policy: { userId }, status: 'PAID', paidDate: { gte: start } },
      select: { amount: true },
    })
    const totalPremiumsPaid = premiumsPaidRows.reduce((s, p) => s + Number(p.amount), 0)

    return {
      data: {
        netWorth,
        totalAssets,
        totalLiabilities,
        totalInsuranceCoverage,
        totalInvestmentValue,
        totalLoanOutstanding,
        totalPremiumsPaid,
        insuranceCoverageByType: [...coverageByType.entries()].map(([insuranceType, value]) => ({ insuranceType, value })),
      },
    }
  }

  /** Lazy-capture-on-read: records at most one snapshot per user per day, so the
   * trend chart accumulates real data over time with no cron job required. */
  async getNetWorthTrend(userId: string) {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const existingToday = await this.prisma.netWorthSnapshot.findFirst({
      where: { userId, recordedAt: { gte: todayStart } },
    })
    if (!existingToday) {
      const summary = (await this.getSummary(userId)).data
      await this.prisma.netWorthSnapshot.create({
        data: { userId, assets: summary.totalAssets, liabilities: summary.totalLiabilities, netWorth: summary.netWorth },
      })
    }

    const snapshots = await this.prisma.netWorthSnapshot.findMany({ where: { userId }, orderBy: { recordedAt: 'asc' } })

    const latestPerMonth = new Map<string, { assets: number; liabilities: number; netWorth: number }>()
    for (const snap of snapshots) {
      const key = `${snap.recordedAt.getFullYear()}-${String(snap.recordedAt.getMonth() + 1).padStart(2, '0')}`
      latestPerMonth.set(key, { assets: Number(snap.assets), liabilities: Number(snap.liabilities), netWorth: Number(snap.netWorth) })
    }
    const series = [...latestPerMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }))

    return { data: { series, hasHistory: snapshots.length > 1 } }
  }

  /** Real PremiumPayment rows grouped by month — no new schema needed. */
  async getPremiumTrend(userId: string) {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
    twelveMonthsAgo.setDate(1)

    const payments = await this.prisma.premiumPayment.findMany({
      where: { policy: { userId }, status: 'PAID', paidDate: { gte: twelveMonthsAgo } },
      select: { paidDate: true, amount: true },
    })

    const byMonth = new Map<string, number>()
    for (const p of payments) {
      if (!p.paidDate) continue
      const key = `${p.paidDate.getFullYear()}-${String(p.paidDate.getMonth() + 1).padStart(2, '0')}`
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(p.amount))
    }
    const series = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, paid]) => ({ month, paid }))

    return { data: { series, hasHistory: series.length > 0 } }
  }

  /**
   * Simplified estimate, not tax advice — 80C from LIFE premiums + PPF/ULIP
   * investments; 80D from HEALTH premiums; 24(b) from home-loan interest paid;
   * 80CCD(1B) from NPS investments. All scoped to the current financial year.
   */
  async getTaxSummary(userId: string) {
    const { start, end, label } = currentFinancialYear()

    const [lifePremiums, healthPremiums, homeLoanEmis, ppfUlipInvestments, npsInvestments] = await this.prisma.$transaction([
      this.prisma.premiumPayment.findMany({
        where: { policy: { userId, insuranceType: 'LIFE' }, status: 'PAID', paidDate: { gte: start, lt: end } },
        select: { amount: true },
      }),
      this.prisma.premiumPayment.findMany({
        where: { policy: { userId, insuranceType: 'HEALTH' }, status: 'PAID', paidDate: { gte: start, lt: end } },
        select: { amount: true },
      }),
      this.prisma.emiPayment.findMany({
        where: { loan: { userId, loanType: 'HOME_LOAN' }, status: 'PAID', paidDate: { gte: start, lt: end } },
        select: { interest: true },
      }),
      this.prisma.investment.findMany({
        where: { userId, investmentType: { in: ['PPF', 'ULIP'] }, investmentDate: { gte: start, lt: end } },
        select: { amountInvested: true },
      }),
      this.prisma.investment.findMany({
        where: { userId, investmentType: 'NPS', investmentDate: { gte: start, lt: end } },
        select: { amountInvested: true },
      }),
    ])

    const sec80C = Math.min(150000,
      lifePremiums.reduce((s, p) => s + Number(p.amount), 0) +
      ppfUlipInvestments.reduce((s, i) => s + Number(i.amountInvested), 0))
    const sec80D = Math.min(75000, healthPremiums.reduce((s, p) => s + Number(p.amount), 0))
    const sec24b = Math.min(200000, homeLoanEmis.reduce((s, e) => s + Number(e.interest ?? 0), 0))
    const sec80CCD1B = Math.min(50000, npsInvestments.reduce((s, i) => s + Number(i.amountInvested), 0))

    return {
      data: {
        financialYear: label,
        sections: [
          { section: 'Section 80C', desc: 'ELSS + PPF + Life Insurance Premium', amount: sec80C, limit: 150000 },
          { section: 'Section 80D', desc: 'Health Insurance Premium', amount: sec80D, limit: 75000 },
          { section: 'Section 24(b)', desc: 'Home Loan Interest Deduction', amount: sec24b, limit: 200000 },
          { section: 'Section 80CCD(1B)', desc: 'NPS Additional Contribution', amount: sec80CCD1B, limit: 50000 },
        ],
        totalDeductions: sec80C + sec80D + sec24b + sec80CCD1B,
      },
    }
  }
}
