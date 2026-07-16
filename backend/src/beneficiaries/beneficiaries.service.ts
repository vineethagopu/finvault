import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const data = await this.prisma.beneficiary.findMany({
      where: { userId },
      include: { policy: { select: { id: true, policyName: true, policyNumber: true } } },
      orderBy: { sharePercent: 'desc' },
    })
    const totalShare = data.reduce((s, b) => s + Number(b.sharePercent), 0)
    return { data, meta: { totalShare } }
  }

  async getSummary(userId: string) {
    const data = await this.prisma.beneficiary.findMany({
      where: { userId },
      include: { policy: { select: { policyName: true } } },
    })

    const total = data.length
    const primary = data.filter((b) => b.type === 'NOMINEE').length
    const other = total - primary
    const policiesWithBeneficiaries = new Set(data.filter((b) => b.policyId).map((b) => b.policyId)).size

    const byPolicy = new Map<string, number>()
    for (const b of data) {
      const key = b.policy?.policyName ?? 'Unlinked'
      byPolicy.set(key, (byPolicy.get(key) ?? 0) + 1)
    }

    return {
      data: {
        total,
        primary,
        other,
        policiesWithBeneficiaries,
        byPolicy: [...byPolicy.entries()].map(([policyName, count]) => ({ policyName, count })),
      },
    }
  }

  async create(userId: string, dto: any) {
    if (dto.policyId) {
      const policy = await this.prisma.policy.findFirst({ where: { id: dto.policyId, userId } })
      if (!policy) throw new ForbiddenException('Policy not found')
    }

    // Check total share will not exceed 100
    const existing = await this.prisma.beneficiary.findMany({ where: { userId } })
    const usedShare = existing.reduce((s, b) => s + Number(b.sharePercent), 0)
    if (usedShare + Number(dto.sharePercent) > 100) {
      throw new BadRequestException(`Cannot exceed 100% total. Currently ${usedShare}% allocated.`)
    }

    const { dateOfBirth, ...rest } = dto
    const beneficiary = await this.prisma.beneficiary.create({
      data: { ...rest, userId, ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }) },
    })
    return { data: beneficiary, message: 'Beneficiary added' }
  }

  async update(userId: string, id: string, dto: any) {
    await this.assertOwnership(userId, id)
    const { dateOfBirth, ...rest } = dto
    const beneficiary = await this.prisma.beneficiary.update({
      where: { id },
      data: { ...rest, ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }) },
    })
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
