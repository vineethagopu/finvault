import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: any) {
    const { page = 1, limit = 20, loanType, status } = query
    const where: any = { userId }
    if (loanType) where.loanType = loanType
    if (status) where.status = status

    const [data, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({ where, orderBy: { nextEmiDate: 'asc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.loan.count({ where }),
    ])

    const totalOutstanding = data.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + Number(l.outstandingAmount), 0)
    const totalEmi = data.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + Number(l.emiAmount), 0)

    return { data, meta: { total, page, limit, totalOutstanding, totalEmi } }
  }

  async findOne(userId: string, id: string) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
      include: { emiPayments: { orderBy: { dueDate: 'desc' }, take: 12 } },
    })
    if (!loan) throw new NotFoundException('Loan not found')
    return { data: loan }
  }

  async create(userId: string, dto: any) {
    const loan = await this.prisma.loan.create({
      data: {
        ...dto,
        userId,
        disbursedDate: new Date(dto.disbursedDate),
        maturityDate: new Date(dto.maturityDate),
        nextEmiDate: dto.nextEmiDate ? new Date(dto.nextEmiDate) : undefined,
      },
    })
    return { data: loan, message: 'Loan added' }
  }

  async update(userId: string, id: string, dto: any) {
    await this.assertOwnership(userId, id)
    const loan = await this.prisma.loan.update({ where: { id }, data: dto })
    return { data: loan, message: 'Loan updated' }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.loan.delete({ where: { id } })
    return { message: 'Loan removed' }
  }

  private async assertOwnership(userId: string, id: string) {
    const loan = await this.prisma.loan.findFirst({ where: { id, userId } })
    if (!loan) throw new ForbiddenException('Access denied')
    return loan
  }

  /**
   * Simplified, documented placeholder formula — not fed by any real insurer
   * surrender-value feed. Per active LIFE policy: eligibility = 80% of sumAssured;
   * outstanding = sum of outstandingAmount on active loans secured by that policy.
   */
  async getEligibility(userId: string) {
    const [lifePolicies, securedLoans] = await this.prisma.$transaction([
      this.prisma.policy.findMany({
        where: { userId, insuranceType: 'LIFE', status: 'ACTIVE' },
        select: { id: true, policyName: true, policyNumber: true, sumAssured: true },
      }),
      this.prisma.loan.findMany({
        where: { userId, securedByPolicyId: { not: null }, status: { in: ['ACTIVE', 'OVERDUE'] } },
        select: { securedByPolicyId: true, outstandingAmount: true },
      }),
    ])

    const outstandingByPolicy = new Map<string, number>()
    for (const loan of securedLoans) {
      if (!loan.securedByPolicyId) continue
      outstandingByPolicy.set(
        loan.securedByPolicyId,
        (outstandingByPolicy.get(loan.securedByPolicyId) ?? 0) + Number(loan.outstandingAmount),
      )
    }

    const byPolicy = lifePolicies.map((p) => {
      const eligibility = Number(p.sumAssured) * 0.8
      const outstanding = outstandingByPolicy.get(p.id) ?? 0
      return {
        policyId: p.id,
        policyName: p.policyName,
        policyNumber: p.policyNumber,
        sumAssured: Number(p.sumAssured),
        eligibility,
        eligibilityPct: 80,
        outstanding,
        available: Math.max(0, eligibility - outstanding),
      }
    })

    const totalEligibility = byPolicy.reduce((s, p) => s + p.eligibility, 0)
    const totalOutstanding = byPolicy.reduce((s, p) => s + p.outstanding, 0)
    const totalAvailable = Math.max(0, totalEligibility - totalOutstanding)

    return {
      data: {
        totalEligibility,
        totalOutstanding,
        totalAvailable,
        availablePercent: totalEligibility > 0 ? Math.round((totalAvailable / totalEligibility) * 100) : 0,
        utilizedPercent: totalEligibility > 0 ? Math.round((totalOutstanding / totalEligibility) * 100) : 0,
        activeAccounts: securedLoans.length,
        byPolicy,
      },
    }
  }

  async getDocuments(userId: string, loanId: string) {
    await this.assertOwnership(userId, loanId)
    const links = await this.prisma.loanDocument.findMany({
      where: { loanId },
      include: { document: true },
      orderBy: { createdAt: 'desc' },
    })
    return { data: links }
  }

  /** No dedicated transaction ledger — derived from real EmiPayment rows plus a
   * synthetic "Loan Disbursal" entry from the loan's own disbursedDate/principal. */
  async getTransactions(userId: string, loanId: string) {
    const loan = await this.assertOwnership(userId, loanId)
    const payments = await this.prisma.emiPayment.findMany({
      where: { loanId, status: 'PAID' },
      orderBy: { paidDate: 'desc' },
    })

    const transactions = [
      ...payments.map((p) => ({
        id: p.id,
        date: p.paidDate ?? p.dueDate,
        description: `EMI Payment`,
        amount: Number(p.amount),
        type: 'EMI_PAYMENT',
      })),
      {
        id: `${loan.id}-disbursal`,
        date: loan.disbursedDate,
        description: 'Loan Disbursal',
        amount: Number(loan.principalAmount),
        type: 'DISBURSAL',
      },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return { data: transactions }
  }
}
