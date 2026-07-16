import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InsuranceType, PolicyStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePolicyDto, UpdatePolicyDto, PolicyFiltersDto } from './dto/policy.dto'

@Injectable()
export class PoliciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, filters: PolicyFiltersDto) {
    const { page = 1, limit = 20, insuranceType, status, search } = filters

    const where: any = { userId }
    if (insuranceType) where.insuranceType = insuranceType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { policyName: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { policyNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.policy.findMany({
        where,
        include: { nominees: true, _count: { select: { policyDocuments: true } } },
        orderBy: { nextPremiumDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.policy.count({ where }),
    ])

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    }
  }

  async findOne(userId: string, id: string) {
    const policy = await this.prisma.policy.findFirst({
      where: { id, userId },
      include: { nominees: true, policyDocuments: { include: { document: true } }, premiumPayments: true },
    })
    if (!policy) throw new NotFoundException('Policy not found')
    return { data: policy }
  }

  async create(userId: string, dto: CreatePolicyDto) {
    const { nominees, ...policyData } = dto

    const policy = await this.prisma.policy.create({
      data: {
        ...policyData,
        userId,
        insuranceType: policyData.insuranceType as InsuranceType,
        sumAssured: policyData.sumAssured,
        premiumAmount: policyData.premiumAmount,
        policyStartDate: new Date(policyData.policyStartDate),
        policyEndDate: new Date(policyData.policyEndDate),
        nextPremiumDate: policyData.nextPremiumDate ? new Date(policyData.nextPremiumDate) : undefined,
        nominees: nominees?.length
          ? { create: nominees.map(n => ({ ...n, sharePercent: n.sharePercent })) }
          : undefined,
      },
      include: { nominees: true },
    })

    return { data: policy, message: 'Policy created successfully' }
  }

  async update(userId: string, id: string, dto: UpdatePolicyDto) {
    await this.assertOwnership(userId, id)

    const { nominees, insuranceType, policyStartDate, policyEndDate, nextPremiumDate, ...rest } = dto

    const policy = await this.prisma.policy.update({
      where: { id },
      data: {
        ...rest,
        ...(insuranceType && { insuranceType: insuranceType as InsuranceType }),
        ...(policyStartDate && { policyStartDate: new Date(policyStartDate) }),
        ...(policyEndDate && { policyEndDate: new Date(policyEndDate) }),
        ...(nextPremiumDate && { nextPremiumDate: new Date(nextPremiumDate) }),
      },
      include: { nominees: true },
    })

    return { data: policy, message: 'Policy updated' }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await this.prisma.policy.delete({ where: { id } })
    return { message: 'Policy deleted' }
  }

  async getSummary(userId: string) {
    const [policies, premiumsDue] = await this.prisma.$transaction([
      this.prisma.policy.findMany({
        where: { userId },
        select: { insuranceType: true, status: true, sumAssured: true, premiumAmount: true },
      }),
      this.prisma.premiumPayment.findMany({
        where: {
          policy: { userId },
          status: { in: ['UPCOMING', 'OVERDUE'] },
          dueDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        },
        include: { policy: { select: { policyName: true, insuranceType: true } } },
        orderBy: { dueDate: 'asc' },
      }),
    ])

    const totalSumAssured = policies.reduce((s, p) => s + Number(p.sumAssured), 0)
    const activePolicies = policies.filter(p => p.status === 'ACTIVE').length

    return {
      data: {
        totalPolicies: policies.length,
        activePolicies,
        totalSumAssured,
        premiumsDue,
      },
    }
  }

  private async assertOwnership(userId: string, policyId: string) {
    const policy = await this.prisma.policy.findFirst({ where: { id: policyId, userId } })
    if (!policy) throw new ForbiddenException('Access denied')
    return policy
  }

  async getAllPolicyDocuments(userId: string) {
    const links = await this.prisma.policyDocument.findMany({
      where: { policy: { userId } },
      include: {
        document: true,
        policy: { select: { id: true, policyName: true, provider: true, policyNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { data: links }
  }

  async getPolicyDocuments(userId: string, policyId: string) {
    await this.assertOwnership(userId, policyId)
    const links = await this.prisma.policyDocument.findMany({
      where: { policyId },
      include: { document: true },
      orderBy: { createdAt: 'desc' },
    })
    return { data: links }
  }

  async getPolicyPayments(userId: string, policyId: string) {
    await this.assertOwnership(userId, policyId)
    const payments = await this.prisma.premiumPayment.findMany({
      where: { policyId },
      orderBy: { dueDate: 'desc' },
    })
    return { data: payments }
  }

  async addNominee(userId: string, policyId: string, dto: any) {
    await this.assertOwnership(userId, policyId)
    const nominee = await this.prisma.nominee.create({
      data: {
        policyId,
        fullName: dto.fullName,
        relationship: dto.relationship,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        sharePercent: dto.sharePercent,
        mobile: dto.mobile,
        email: dto.email,
        address: dto.address,
      },
    })
    return { data: nominee, message: 'Nominee added' }
  }

  async updateNominee(userId: string, policyId: string, nomineeId: string, dto: any) {
    await this.assertOwnership(userId, policyId)
    const existing = await this.prisma.nominee.findFirst({ where: { id: nomineeId, policyId } })
    if (!existing) throw new NotFoundException('Nominee not found')

    const { dateOfBirth, ...rest } = dto
    const nominee = await this.prisma.nominee.update({
      where: { id: nomineeId },
      data: { ...rest, ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }) },
    })
    return { data: nominee, message: 'Nominee updated' }
  }

  async removeNominee(userId: string, policyId: string, nomineeId: string) {
    await this.assertOwnership(userId, policyId)
    const existing = await this.prisma.nominee.findFirst({ where: { id: nomineeId, policyId } })
    if (!existing) throw new NotFoundException('Nominee not found')
    await this.prisma.nominee.delete({ where: { id: nomineeId } })
    return { message: 'Nominee removed' }
  }
}
