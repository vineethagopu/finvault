import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.catalogItem.findMany({
      where: { isActive: true },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    })

    const sections = new Map<string, typeof items>()
    for (const item of items) {
      if (!sections.has(item.section)) sections.set(item.section, [])
      sections.get(item.section)!.push(item)
    }

    return { data: [...sections.entries()].map(([section, tiles]) => ({ section, tiles })) }
  }
}
