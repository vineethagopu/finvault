import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EventsService } from '../events/events.service'

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async findAll(userId: string, query: any) {
    // Query params always arrive as strings; Prisma's `take`/`skip` require real
    // numbers, so coerce explicitly instead of trusting the destructured defaults.
    const page = Number(query.page) > 0 ? Number(query.page) : 1
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 30
    const { category, unreadOnly } = query
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
    this.events.emit(userId, { type: 'notification.changed' })
    return { message: 'Marked as read' }
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    this.events.emit(userId, { type: 'notification.changed' })
    return { message: 'All notifications marked as read' }
  }

  async delete(userId: string, id: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } })
    this.events.emit(userId, { type: 'notification.changed' })
    return { message: 'Notification deleted' }
  }

  async create(userId: string, data: { type: any; category: any; title: string; message: string; data?: any }) {
    const notification = await this.prisma.notification.create({ data: { ...data, userId } })
    this.events.emit(userId, { type: 'notification.created' })
    return notification
  }
}
