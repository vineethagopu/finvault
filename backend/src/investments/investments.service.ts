import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EventsService } from '../events/events.service'

@Injectable()
export class InvestmentsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async findAll(userId: string, query: any) {
    // Query params always arrive as strings; Prisma's `take`/`skip` require real
    // numbers, so coerce explicitly instead of trusting the destructured defaults.
    const page = Number(query.page) > 0 ? Number(query.page) : 1
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20
    const { investmentType, assetClass, search } = query
    const where: any = { userId }
    if (investmentType) where.investmentType = investmentType
    if (assetClass) where.assetClass = assetClass
    if (search) where.OR = [
      { investmentName: { contains: search, mode: 'insensitive' } },
      { provider: { contains: search, mode: 'insensitive' } },
    ]

    const [data, total] = await this.prisma.$transaction([
      this.prisma.investment.findMany({ where, orderBy: { currentValue: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.investment.count({ where }),
    ])

    const totalInvested = data.reduce((s, i) => s + Number(i.amountInvested), 0)
    const totalValue = data.reduce((s, i) => s + Number(i.currentValue), 0)

    return { data, meta: { total, page, limit, totalInvested, totalValue } }
  }

  async findOne(userId: string, id: string) {
    const inv = await this.prisma.investment.findFirst({ where: { id, userId } })
    if (!inv) throw new NotFoundException('Investment not found')
    return { data: inv }
  }

  async create(userId: string, dto: any) {
    const investment = await this.prisma.investment.create({
      data: {
        ...dto,
        userId,
        investmentDate: new Date(dto.investmentDate),
        maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : undefined,
      },
    })
    // Seed the first real history point so the performance chart has data from day one.
    await this.prisma.investmentSnapshot.create({
      data: { investmentId: investment.id, userId, value: investment.currentValue },
    })
    // Push a live update so the Investments list and Dashboard refresh without
    // a manual reload — including in other open tabs/devices.
    this.events.emit(userId, { type: 'investment.changed' })
    return { data: investment, message: 'Investment added' }
  }

  async update(userId: string, id: string, dto: any) {
    await this.assertOwnership(userId, id)
    const investment = await this.prisma.investment.update({ where: { id }, data: dto })
    if (dto.currentValue !== undefined) {
      await this.prisma.investmentSnapshot.create({
        data: { investmentId: id, userId, value: investment.currentValue },
      })
    }
    this.events.emit(userId, { type: 'investment.changed' })
    return { data: investment, message: 'Investment updated' }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.investment.delete({ where: { id } })
    this.events.emit(userId, { type: 'investment.changed' })
    return { message: 'Investment removed' }
  }

  private async assertOwnership(userId: string, id: string) {
    const inv = await this.prisma.investment.findFirst({ where: { id, userId } })
    if (!inv) throw new ForbiddenException('Access denied')
    return inv
  }

  async getOverview(userId: string) {
    const investments = await this.prisma.investment.findMany({ where: { userId } })

    const totalInvested = investments.reduce((s, i) => s + Number(i.amountInvested), 0)
    const totalValue = investments.reduce((s, i) => s + Number(i.currentValue), 0)
    const gain = totalValue - totalInvested
    const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0

    const allocationMap = new Map<string, number>()
    for (const inv of investments) {
      allocationMap.set(inv.assetClass, (allocationMap.get(inv.assetClass) ?? 0) + Number(inv.currentValue))
    }
    const allocation = [...allocationMap.entries()].map(([assetClass, amount]) => ({
      assetClass,
      amount,
      percent: totalValue > 0 ? Math.round((amount / totalValue) * 1000) / 10 : 0,
    }))

    return {
      data: {
        totalInvested,
        totalValue,
        gain,
        gainPercent: Math.round(gainPercent * 100) / 100,
        activeCount: investments.filter((i) => i.status === 'ACTIVE').length,
        categoryCount: allocationMap.size,
        allocation,
      },
    }
  }

  /** Real historical points from InvestmentSnapshot. Lazily records today's total
   * value once per day so the chart keeps accumulating real data with no cron job. */
  async getPerformance(userId: string) {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const existingToday = await this.prisma.investmentSnapshot.findFirst({
      where: { userId, recordedAt: { gte: todayStart } },
    })
    if (!existingToday) {
      const investments = await this.prisma.investment.findMany({ where: { userId } })
      await this.prisma.investmentSnapshot.createMany({
        data: investments.map((i) => ({ investmentId: i.id, userId, value: i.currentValue })),
      })
    }

    const snapshots = await this.prisma.investmentSnapshot.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
    })

    // Aggregate to one total-value-per-month series, using each investment's
    // latest snapshot within that month (not a sum of every point recorded).
    const latestPerInvestmentPerMonth = new Map<string, Map<string, number>>()
    for (const snap of snapshots) {
      const monthKey = `${snap.recordedAt.getFullYear()}-${String(snap.recordedAt.getMonth() + 1).padStart(2, '0')}`
      if (!latestPerInvestmentPerMonth.has(monthKey)) latestPerInvestmentPerMonth.set(monthKey, new Map())
      latestPerInvestmentPerMonth.get(monthKey)!.set(snap.investmentId, Number(snap.value))
    }
    const series = [...latestPerInvestmentPerMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, byInvestment]) => ({
        month,
        value: [...byInvestment.values()].reduce((s, v) => s + v, 0),
      }))

    return { data: { series, hasHistory: snapshots.length > 1 } }
  }
}
