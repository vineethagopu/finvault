import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const data = await this.prisma.beneficiary.findMany({
      where: { userId },
      orderBy: { sharePercent: 'desc' },
    })
    const totalShare = data.reduce((s, b) => s + Number(b.sharePercent), 0)
    return { data, meta: { totalShare } }
  }

  async create(userId: string, dto: any) {
    // Check total share will not exceed 100
    const existing = await this.prisma.beneficiary.findMany({ where: { userId } })
    const usedShare = existing.reduce((s, b) => s + Number(b.sharePercent), 0)
    if (usedShare + Number(dto.sharePercent) > 100) {
      throw new BadRequestException(`Cannot exceed 100% total. Currently ${usedShare}% allocated.`)
    }

    const beneficiary = await this.prisma.beneficiary.create({
      data: { ...dto, userId },
    })
    return { data: beneficiary, message: 'Beneficiary added' }
  }

  async update(userId: string, id: string, dto: any) {
    await this.assertOwnership(userId, id)
    const beneficiary = await this.prisma.beneficiary.update({ where: { id }, data: dto })
    return { data: beneficiary }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.beneficiary.delete({ where: { id } })
    return { message: 'Beneficiary removed' }
  }

  private async assertOwnership(userId: string, id: string) {
    const ben = await this.prisma.beneficiary.findFirst({ where: { id, userId } })
    if (!ben) throw new ForbiddenException('Access denied')
    return ben
  }
}
