import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EventsService } from '../events/events.service'
import { StorageService } from '../storage/storage.service'
import { UploadDocumentDto, DocumentFiltersDto } from './dto/document.dto'
import * as path from 'path'
import * as crypto from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private storage: StorageService,
  ) {}

  async findAll(userId: string, filters: DocumentFiltersDto) {
    const page = parseInt(filters.page || '1', 10)
    const limit = parseInt(filters.limit || '20', 10)
    const where: any = { userId }
    if (filters.category) where.category = filters.category
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' }
    }

    const [data, total, categoryCounts] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, mimeType: true, size: true,
          category: true, tags: true, scanStatus: true,
          createdAt: true, updatedAt: true,
          policyDocuments: { select: { docType: true, policy: { select: { policyName: true } } }, take: 1 },
          loanDocuments: { select: { docType: true, loan: { select: { loanName: true } } }, take: 1 },
          // s3Key / s3Bucket never returned to client
        },
      }),
      this.prisma.document.count({ where }),
      this.prisma.document.groupBy({ by: ['category'], where: { userId }, _count: true, orderBy: { category: 'asc' } }),
    ])

    const storageUsed = await this.prisma.document.aggregate({
      where: { userId },
      _sum: { size: true },
    })

    const linked = data.map((doc) => {
      const { policyDocuments, loanDocuments, ...rest } = doc
      const link = policyDocuments[0]
        ? { linkedTo: policyDocuments[0].policy.policyName, docType: policyDocuments[0].docType }
        : loanDocuments[0]
          ? { linkedTo: loanDocuments[0].loan.loanName, docType: loanDocuments[0].docType }
          : { linkedTo: null, docType: null }
      return { ...rest, ...link }
    })

    return {
      data: linked,
      meta: {
        total, page, limit,
        pages: Math.ceil(total / limit),
        storageUsedBytes: Number(storageUsed._sum.size || 0),
        totalAll: total,
        byCategory: Object.fromEntries(categoryCounts.map((c) => [c.category, c._count])),
      },
    }
  }

  async upload(userId: string, file: Express.Multer.File, dto: UploadDocumentDto) {
    if (!file) throw new BadRequestException('No file provided')
    if (file.size > MAX_FILE_SIZE) throw new BadRequestException('File too large (max 10 MB)')
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed')
    }

    // Sanitize filename — never use original client filename as path
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '')
    const safeFilename = `${crypto.randomUUID()}${ext}`
    const stored = await this.storage.put(userId, safeFilename, file.buffer, file.mimetype)

    const tags = dto.tags ? dto.tags.split(',').map(t => t.trim()).filter(Boolean) : []

    const document = await this.prisma.document.create({
      data: {
        userId,
        name: dto.name || file.originalname.slice(0, 200),
        category: (dto.category as any) || 'OTHER',
        tags,
        fileName: safeFilename,
        mimeType: file.mimetype,
        size: file.size,
        // Object key + bucket when S3/R2 is configured; local path + the
        // 'local' sentinel otherwise. Recorded per-row so files written under
        // one backend stay readable after switching to the other.
        s3Key: stored.key,
        s3Bucket: stored.bucket,
        isEncrypted: false,
        scanStatus: 'CLEAN',
        ...(dto.policyId && {
          policyDocuments: { create: { policyId: dto.policyId, docType: dto.docType } },
        }),
        ...(dto.loanId && {
          loanDocuments: { create: { loanId: dto.loanId, docType: dto.docType } },
        }),
      },
    })

    // Push a live update so the Documents list and Dashboard refresh without a
    // manual reload — including in other open tabs/devices.
    this.events.emit(userId, { type: 'document.changed' })
    return {
      data: {
        id: document.id,
        name: document.name,
        mimeType: document.mimeType,
        size: document.size,
        category: document.category,
        createdAt: document.createdAt,
      },
      message: 'Document uploaded',
    }
  }

  async serveFile(userId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, userId } })
    if (!doc) throw new NotFoundException('Document not found')
    return doc
  }

  /**
   * Resolve a document to its metadata plus a readable stream, reading from
   * whichever backend the row was written to.
   */
  async downloadFile(userId: string, id: string) {
    const doc = await this.serveFile(userId, id)
    const stream = await this.storage.getStream(doc.s3Key, doc.s3Bucket)
    return { doc, stream }
  }

  async remove(userId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, userId } })
    if (!doc) throw new ForbiddenException('Access denied')

    await this.storage.delete(doc.s3Key, doc.s3Bucket)

    await this.prisma.document.delete({ where: { id } })
    this.events.emit(userId, { type: 'document.changed' })
    return { message: 'Document deleted' }
  }
}
