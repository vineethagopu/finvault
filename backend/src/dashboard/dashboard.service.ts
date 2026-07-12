import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const INSURANCE_KEY_MAP: Record<string, string> = {
  LIFE: 'life',
  HEALTH: 'health',
  VEHICLE: 'vehicle',
  TRAVEL: 'travel',
  HOME: 'home',
  // No dedicated PET enum in the schema — pet/animal policies are stored as OTHER
  OTHER: 'pet',
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /** Parse "May 2025" / "2025-05" into the first day of that month; defaults to the current month. */
  private resolveMonthWindow(month?: string) {
    let start = new Date()
    if (month) {
      const parsed = /^\d{4}-\d{2}$/.test(month)
        ? new Date(`${month}-01T00:00:00`)
        : new Date(`01 ${month}`)
      if (!isNaN(parsed.getTime())) start = parsed
    }
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1)
    return { monthStart, monthEnd }
  }

  private premiumStatusFor(dueDate: Date): string {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'overdue'
    if (days <= 15) return 'due-soon'
    if (days <= 30) return 'upcoming'
    return 'future'
  }

  async getStats(userId: string, month?: string) {
    const { monthStart, monthEnd } = this.resolveMonthWindow(month)

    const [user, policies, premiumPayments, investments, loans, emiPayments] =
      await this.prisma.$transaction([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, planType: true, createdAt: true },
        }),
        this.prisma.policy.findMany({
          where: { userId },
          select: {
            id: true,
            policyName: true,
            provider: true,
            insuranceType: true,
            status: true,
            premiumAmount: true,
            nextPremiumDate: true,
          },
        }),
        this.prisma.premiumPayment.findMany({
          where: {
            policy: { userId },
            status: { in: ['UPCOMING', 'OVERDUE'] },
            dueDate: { gte: monthStart, lt: monthEnd },
          },
          include: { policy: { select: { policyName: true, provider: true } } },
          orderBy: { dueDate: 'asc' },
        }),
        this.prisma.investment.findMany({
          where: { userId, status: 'ACTIVE' },
          select: {
            id: true,
            provider: true,
            investmentType: true,
            isSip: true,
            sipAmount: true,
            sipDay: true,
          },
        }),
        this.prisma.loan.findMany({
          where: { userId, status: { in: ['ACTIVE', 'OVERDUE'] } },
          select: {
            id: true,
            lender: true,
            loanType: true,
            emiAmount: true,
            nextEmiDate: true,
          },
        }),
        this.prisma.emiPayment.findMany({
          where: {
            loan: { userId },
            status: { in: ['UPCOMING', 'OVERDUE'] },
            dueDate: { gte: monthStart, lt: monthEnd },
          },
          include: { loan: { select: { lender: true, loanType: true } } },
          orderBy: { dueDate: 'asc' },
        }),
      ])

    if (!user) throw new NotFoundException('User not found')

    // ── Plan card ────────────────────────────────────────────────
    const planStart = user.createdAt
    const planExpiry = new Date(planStart)
    planExpiry.setFullYear(planExpiry.getFullYear() + 1)
    const planPrefix = user.planType === 'FAMILY' ? 'FAM' : 'IND'
    const plan = {
      type: user.planType === 'FAMILY' ? 'Family Plan' : 'Individual Plan',
      planId: `${planPrefix}-${planStart.getFullYear()}-${user.id.slice(-8).toUpperCase()}`,
      status: 'Active',
      startDate: planStart.toISOString(),
      expiryDate: planExpiry.toISOString(),
      price: 0,
    }

    // ── Insurance summary by type ────────────────────────────────
    const insuranceSummary: Record<string, number> = {
      life: 0, vehicle: 0, travel: 0, home: 0, health: 0, pet: 0,
    }
    for (const p of policies) {
      if (p.status !== 'ACTIVE') continue
      const key = INSURANCE_KEY_MAP[p.insuranceType]
      if (key) insuranceSummary[key] += 1
    }

    // ── Due premiums this month ──────────────────────────────────
    // Payment schedule rows first; fall back to the policy's nextPremiumDate
    // so lightly-seeded data still surfaces dues.
    const coveredPolicyIds = new Set(premiumPayments.map((pp) => pp.policyId))
    const duePremiums = [
      ...premiumPayments.map((pp) => ({
        id: pp.id,
        insurer: pp.policy.provider,
        policyName: pp.policy.policyName,
        dueDate: pp.dueDate.toISOString(),
        amount: Number(pp.amount),
        status: this.premiumStatusFor(pp.dueDate),
      })),
      ...policies
        .filter(
          (p) =>
            p.status === 'ACTIVE' &&
            !coveredPolicyIds.has(p.id) &&
            p.nextPremiumDate &&
            p.nextPremiumDate >= monthStart &&
            p.nextPremiumDate < monthEnd,
        )
        .map((p) => ({
          id: p.id,
          insurer: p.provider,
          policyName: p.policyName,
          dueDate: p.nextPremiumDate!.toISOString(),
          amount: Number(p.premiumAmount),
          status: this.premiumStatusFor(p.nextPremiumDate!),
        })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    // ── Investments (SIPs due this month) ────────────────────────
    const sipItems = investments
      .filter((i) => i.isSip && i.sipAmount)
      .map((i) => {
        const day = Math.min(
          i.sipDay ?? 1,
          new Date(monthEnd.getTime() - 1).getDate(),
        )
        const dueDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        return {
          id: i.id,
          company: i.provider,
          type: i.investmentType === 'MUTUAL_FUND' ? 'SIP' : i.investmentType,
          dueDate: dueDate.toISOString(),
          amount: Number(i.sipAmount),
        }
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    // ── Loans / EMIs due this month ──────────────────────────────
    const coveredLoanIds = new Set(emiPayments.map((e) => e.loanId))
    const loanItems = [
      ...emiPayments.map((e) => ({
        id: e.id,
        provider: e.loan.lender,
        loanType: e.loan.loanType
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        dueDate: e.dueDate.toISOString(),
        emiAmount: Number(e.amount),
      })),
      ...loans
        .filter(
          (l) =>
            !coveredLoanIds.has(l.id) &&
            l.nextEmiDate &&
            l.nextEmiDate >= monthStart &&
            l.nextEmiDate < monthEnd,
        )
        .map((l) => ({
          id: l.id,
          provider: l.lender,
          loanType: l.loanType
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          dueDate: l.nextEmiDate!.toISOString(),
          emiAmount: Number(l.emiAmount),
        })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

    const totalDuePremium = duePremiums.reduce((s, p) => s + p.amount, 0)
    const totalSipDue = sipItems.reduce((s, i) => s + i.amount, 0)
    const totalEmiDue = loanItems.reduce((s, l) => s + l.emiAmount, 0)

    return {
      data: {
        plan,
        totalPolicies: policies.length,
        totalMonthlyCommitment: totalDuePremium + totalSipDue + totalEmiDue,
        insuranceSummary,
        duePremiums,
        investmentOverview: {
          total: investments.length,
          monthlyDue: totalSipDue,
          items: sipItems,
        },
        loanOverview: {
          total: loans.length,
          monthlyEmi: totalEmiDue,
          items: loanItems,
        },
        generatedAt: new Date().toISOString(),
      },
    }
  }

  async getSummary(userId: string) {
    const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)

    const [
      policies,
      investments,
      loans,
      upcomingPremiums,
      upcomingEmis,
      recentNotifications,
      documents,
    ] = await this.prisma.$transaction([
      this.prisma.policy.findMany({
        where: { userId },
        select: { id: true, status: true, sumAssured: true, premiumAmount: true, insuranceType: true },
      }),
      this.prisma.investment.findMany({
        where: { userId },
        select: { id: true, amountInvested: true, currentValue: true, investmentType: true },
      }),
      this.prisma.loan.findMany({
        where: { userId },
        select: { id: true, status: true, outstandingAmount: true, emiAmount: true, loanType: true },
      }),
      this.prisma.premiumPayment.findMany({
        where: {
          policy: { userId },
          status: { in: ['UPCOMING', 'OVERDUE'] },
          dueDate: { lte: thirtyDaysOut },
        },
        include: { policy: { select: { policyName: true, insuranceType: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      this.prisma.emiPayment.findMany({
        where: {
          loan: { userId },
          status: { in: ['UPCOMING', 'OVERDUE'] },
          dueDate: { lte: thirtyDaysOut },
        },
        include: { loan: { select: { loanName: true, loanType: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      this.prisma.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.document.count({ where: { userId } }),
    ])

    const activePolicies = policies.filter(p => p.status === 'ACTIVE')
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')

    const totalSumAssured = activePolicies.reduce((s, p) => s + Number(p.sumAssured), 0)
    const totalPremiumMonthly = activePolicies.reduce((s, p) => s + Number(p.premiumAmount), 0)

    const totalInvested = investments.reduce((s, i) => s + Number(i.amountInvested), 0)
    const totalCurrentValue = investments.reduce((s, i) => s + Number(i.currentValue), 0)
    const investmentGain = totalCurrentValue - totalInvested
    const investmentGainPct = totalInvested > 0 ? (investmentGain / totalInvested) * 100 : 0

    const totalOutstanding = activeLoans.reduce((s, l) => s + Number(l.outstandingAmount), 0)
    const totalEmi = activeLoans.reduce((s, l) => s + Number(l.emiAmount), 0)

    const netWorth = totalCurrentValue + totalSumAssured * 0.1 - totalOutstanding

    return {
      data: {
        netWorth,
        policies: {
          total: policies.length,
          active: activePolicies.length,
          totalSumAssured,
          monthlyPremium: totalPremiumMonthly,
        },
        investments: {
          total: investments.length,
          totalInvested,
          currentValue: totalCurrentValue,
          gain: investmentGain,
          gainPercent: Math.round(investmentGainPct * 100) / 100,
        },
        loans: {
          total: loans.length,
          active: activeLoans.length,
          totalOutstanding,
          monthlyEmi: totalEmi,
        },
        upcomingPremiums,
        upcomingEmis,
        recentNotifications,
        documents,
      },
    }
  }
}
