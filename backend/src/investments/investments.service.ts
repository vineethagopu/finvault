import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: any) {
    const { page = 1, limit = 20, investmentType, assetClass, search } = query
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
    return { data: investment, message: 'Investment added' }
  }

  async update(userId: string, id: string, dto: any) {
    await this.assertOwnership(userId, id)
    const investment = await this.prisma.investment.update({ where: { id }, data: dto })
    return { data: investment, message: 'Investment updated' }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.investment.delete({ where: { id } })
    return { message: 'Investment removed' }
  }

  private async assertOwnership(userId: string, id: string) {
    const inv = await this.prisma.investment.findFirst({ where: { id, userId } })
    if (!inv) throw new ForbiddenException('Access denied')
    return inv
  }
}
