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
}
