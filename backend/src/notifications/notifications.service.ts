import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: any) {
    const { page = 1, limit = 30, category, unreadOnly } = query
    const where: any = { userId }
    if (category) where.category = category
    if (unreadOnly === 'true') where.isRead = false

    const [data, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return { data, meta: { total, page, limit, unreadCount } }
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    })
    return { message: 'Marked as read' }
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return { message: 'All notifications marked as read' }
  }

  async delete(userId: string, id: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } })
    return { message: 'Notification deleted' }
  }

  async create(userId: string, data: { type: any; category: any; title: string; message: string; data?: any }) {
    return this.prisma.notification.create({ data: { ...data, userId } })
  }
}
