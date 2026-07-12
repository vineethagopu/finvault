import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException, Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto, RegisterDto, SendOtpDto, VerifyOtpDto, ChangePasswordDto } from './dto/auth.dto'

const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 5
const REFRESH_TOKEN_EXPIRY_DAYS = 7

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
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
        emailVerified: true,  // verified via OTP before this call
        mobileVerified: true,
      },
    })

    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', ipAddress: ip },
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

    // In production: send via email/SMS service
    // For dev: log to console
    this.logger.log(`OTP for ${dto.contactInfo}: ${code}`)

    return { message: `OTP sent to ${isEmail ? 'email' : 'mobile'}` }
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
}
