import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import { SmsService } from '../sms/sms.service'
import { LoginDto, RegisterDto, RegisterFamilyDto, SendOtpDto, VerifyOtpDto, ChangePasswordDto } from './dto/auth.dto'

const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 5
const REFRESH_TOKEN_EXPIRY_DAYS = 7

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private async assertRecentlyVerified(identifier: string, type: 'EMAIL' | 'MOBILE') {
    const cutoff = new Date()
    cutoff.setMinutes(cutoff.getMinutes() - 30)

    const verified = await this.prisma.otp.findFirst({
      where: { identifier, type: type as any, isUsed: true, createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'desc' },
    })

    if (!verified) {
      throw new BadRequestException(
        `${type === 'EMAIL' ? 'Email' : 'Mobile number'} is not verified. Please verify with OTP first.`,
      )
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    })
  }

  private generateAccessToken(userId: string, username: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, username, role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
      },
    )
  }

  private generateRefreshToken(): string {
    return uuidv4() + '-' + uuidv4()
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.username }],
        isActive: true,
      },
    })

    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passwordValid = await argon2.verify(user.passwordHash, dto.password)
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials')

    const [accessToken, refreshToken] = [
      this.generateAccessToken(user.id, user.username, user.role),
      this.generateRefreshToken(),
    ]

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await this.prisma.$transaction([
      this.prisma.session.create({
        data: { userId: user.id, refreshToken, ipAddress: ip, userAgent, expiresAt },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: ip },
      }),
      this.prisma.auditLog.create({
        data: { userId: user.id, action: 'LOGIN', ipAddress: ip, userAgent },
      }),
    ])

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        planType: user.planType,
        emailVerified: user.emailVerified,
      },
    }
  }

  async register(dto: RegisterDto, ip?: string) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }, { mobile: dto.mobile }],
      },
    })

    if (exists) {
      if (exists.username === dto.username) throw new ConflictException('Username already taken')
      if (exists.email === dto.email) throw new ConflictException('Email already registered')
      if (exists.mobile === dto.mobile) throw new ConflictException('Mobile already registered')
    }

    await this.assertRecentlyVerified(dto.email, 'EMAIL')
    await this.assertRecentlyVerified(dto.mobile, 'MOBILE')

    const passwordHash = await this.hashPassword(dto.password)

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        mobile: dto.mobile,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        planType: (dto.planType as any) || 'INDIVIDUAL',
        emailVerified: true,
        mobileVerified: true,
      },
    })

    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', ipAddress: ip },
    })

    // Best-effort — never blocks or fails registration.
    void this.emailService.sendMail({
      to: user.email,
      subject: 'Welcome to PolicyNext',
      html: `<p>Hi ${user.firstName},</p><p>Your PolicyNext account (username: <b>${user.username}</b>) has been created successfully.</p>`,
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        planType: user.planType,
      },
    }
  }

  async registerFamily(dto: RegisterFamilyDto, ip?: string) {
    const members = dto.members
    if (members.length < 1 || members.length > 5) {
      throw new BadRequestException('A family account needs between 1 and 5 logins')
    }

    const usernames = members.map((m) => m.username)

    // Emails and mobiles may legitimately repeat across members (shared common
    // contact details) — only the login-identifying username must be unique.
    if (new Set(usernames).size !== usernames.length) {
      throw new ConflictException('Each family login needs a unique username')
    }

    const existing = await this.prisma.user.findFirst({ where: { username: { in: usernames } } })
    if (existing) {
      throw new ConflictException(`Username "${existing.username}" already taken`)
    }

    for (const member of members) {
      await this.assertRecentlyVerified(member.email, 'EMAIL')
      await this.assertRecentlyVerified(member.mobile, 'MOBILE')
    }

    const passwordHashes = await Promise.all(members.map((m) => this.hashPassword(m.password)))

    const result = await this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          username: members[0].username,
          email: members[0].email,
          mobile: members[0].mobile,
          firstName: members[0].firstName,
          lastName: members[0].lastName,
          passwordHash: passwordHashes[0],
          planType: 'FAMILY',
          emailVerified: true,
          mobileVerified: true,
        },
      })

      const family = await tx.family.create({
        data: {
          name: dto.familyName || `${members[0].lastName} Family`,
          ownerId: owner.id,
        },
      })

      await tx.familyMembership.create({
        data: { familyId: family.id, userId: owner.id, role: 'OWNER', relationship: members[0].relationship || 'Self' },
      })

      const createdMembers = [owner]

      for (let i = 1; i < members.length; i++) {
        const m = members[i]
        const user = await tx.user.create({
          data: {
            username: m.username,
            email: m.email,
            mobile: m.mobile,
            firstName: m.firstName,
            lastName: m.lastName,
            passwordHash: passwordHashes[i],
            planType: 'FAMILY',
            emailVerified: true,
            mobileVerified: true,
          },
        })
        await tx.familyMembership.create({
          data: { familyId: family.id, userId: user.id, role: 'MEMBER', relationship: m.relationship || null },
        })
        createdMembers.push(user)
      }

      return { family, owner, createdMembers }
    })

    await this.prisma.auditLog.create({
      data: { userId: result.owner.id, action: 'REGISTER_FAMILY', ipAddress: ip },
    })

    for (const user of result.createdMembers) {
      void this.emailService.sendMail({
        to: user.email,
        subject: 'Welcome to PolicyNext',
        html: `<p>Hi ${user.firstName},</p><p>Your PolicyNext family account (username: <b>${user.username}</b>) has been created successfully.</p>`,
      })
    }

    return {
      user: {
        id: result.owner.id,
        username: result.owner.username,
        email: result.owner.email,
        firstName: result.owner.firstName,
        role: result.owner.role,
        planType: result.owner.planType,
      },
      familyId: result.family.id,
      memberCount: result.createdMembers.length,
    }
  }

  async sendOtp(dto: SendOtpDto) {
    const isEmail = dto.contactInfo.includes('@')
    const type = isEmail ? 'EMAIL' : 'MOBILE'
    const code = this.generateOtp()

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

    // Invalidate existing unused OTPs for this identifier
    await this.prisma.otp.updateMany({
      where: { identifier: dto.contactInfo, type: type as any, isUsed: false },
      data: { isUsed: true },
    })

    await this.prisma.otp.create({
      data: { type: type as any, code, identifier: dto.contactInfo, expiresAt },
    })

    // Always logged for local/dev debugging, in addition to the real send below.
    this.logger.log(`OTP for ${dto.contactInfo}: ${code}`)

    if (isEmail) {
      void this.emailService.sendMail({
        to: dto.contactInfo,
        subject: 'Your PolicyNext verification code',
        html: `<p>Your OTP is <b>${code}</b>. It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
      })
    } else {
      void this.smsService.sendSms(dto.contactInfo, `Your PolicyNext verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`)
    }

    // Only surface the raw code back to the client as a fallback when a real
    // SMS provider isn't configured yet (dev/local) — once TWILIO_* env vars
    // are set, smsService.usingRealProvider flips true and this disappears.
    const devCode = !isEmail && !this.smsService.usingRealProvider && process.env.NODE_ENV !== 'production' ? code : undefined

    return { message: `OTP sent to ${isEmail ? 'email' : 'mobile'}`, devCode }
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        identifier: dto.identifier,
        type: dto.type as any,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) throw new BadRequestException('Invalid or expired OTP')

    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      throw new BadRequestException('Too many attempts. Request a new OTP')
    }

    if (otp.code !== dto.otp) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      })
      throw new BadRequestException('Invalid OTP')
    }

    await this.prisma.otp.update({ where: { id: otp.id }, data: { isUsed: true } })

    return { verified: true }
  }

  async refreshTokens(refreshToken: string, ip?: string, userAgent?: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { select: { id: true, username: true, role: true, isActive: true } } },
    })

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session')
    }

    if (!session.user.isActive) throw new UnauthorizedException('Account deactivated')

    // Rotate refresh token
    const newRefreshToken = this.generateRefreshToken()
    const newAccessToken = this.generateAccessToken(
      session.user.id, session.user.username, session.user.role,
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

    await this.prisma.$transaction([
      this.prisma.session.update({ where: { id: session.id }, data: { isRevoked: true } }),
      this.prisma.session.create({
        data: { userId: session.userId, refreshToken: newRefreshToken, ipAddress: ip, userAgent, expiresAt },
      }),
    ])

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async logout(refreshToken: string, userId: string) {
    await this.prisma.session.updateMany({
      where: { refreshToken, userId },
      data: { isRevoked: true },
    })
    await this.prisma.auditLog.create({
      data: { userId, action: 'LOGOUT' },
    })
    return { message: 'Logged out successfully' }
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    })
    return { message: 'All sessions revoked' }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword)
    if (!valid) throw new UnauthorizedException('Current password is incorrect')

    const newHash = await this.hashPassword(dto.newPassword)

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
      this.prisma.session.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } }),
      this.prisma.auditLog.create({ data: { userId, action: 'PASSWORD_CHANGED' } }),
    ])

    return { message: 'Password changed. Please log in again.' }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, email: true, mobile: true,
        firstName: true, lastName: true, dateOfBirth: true,
        address: true, occupation: true, annualIncome: true,
        role: true, planType: true, emailVerified: true, mobileVerified: true,
        twoFAEnabled: true, avatarUrl: true, lastLoginAt: true, createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return { data: user }
  }

  async updateProfile(userId: string, dto: any) {
    const { dateOfBirth, ...rest } = dto
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...rest, ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }) },
      select: {
        id: true, username: true, email: true, mobile: true,
        firstName: true, lastName: true, dateOfBirth: true,
        address: true, occupation: true, annualIncome: true,
        role: true, planType: true, avatarUrl: true,
      },
    })
    return { data: user, message: 'Profile updated' }
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    })
    return { data: user, message: 'Avatar updated' }
  }

  async getSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, deviceInfo: true, ipAddress: true, userAgent: true, createdAt: true, refreshToken: true },
    })
    return {
      data: sessions.map((s) => ({
        id: s.id,
        deviceInfo: s.deviceInfo,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        isCurrent: s.refreshToken === currentRefreshToken,
      })),
    }
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } })
    if (!session) throw new NotFoundException('Session not found')
    await this.prisma.session.update({ where: { id: sessionId }, data: { isRevoked: true } })
    return { message: 'Session revoked' }
  }

  async getNotificationPreferences(userId: string) {
    const prefs = await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })
    return { data: prefs }
  }

  async updateNotificationPreferences(userId: string, dto: any) {
    const prefs = await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    })
    return { data: prefs, message: 'Notification preferences updated' }
  }
}
