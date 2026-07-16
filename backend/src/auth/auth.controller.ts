import {
  Controller, Post, Get, Patch, Delete, Body, Param, Req, Res, HttpCode, HttpStatus, UseGuards,
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, BadRequestException, StreamableFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import * as fsSync from 'fs'
import { Throttle } from '@nestjs/throttler'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as crypto from 'crypto'
import { AuthService } from './auth.service'
import {
  LoginDto, RegisterDto, RegisterFamilyDto, SendOtpDto, VerifyOtpDto, ChangePasswordDto,
  UpdateProfileDto, UpdateNotificationPreferenceDto,
} from './dto/auth.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 min
}

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with username/password' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, req.ip, req.headers['user-agent'])
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS)
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS)
    return { data: { user: result.user, message: 'Login successful' } }
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register new account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip)
  }

  @Public()
  @Post('register/family')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a family account (up to 5 logins)' })
  async registerFamily(@Body() dto: RegisterFamilyDto, @Req() req: Request) {
    return this.authService.registerFamily(dto, req.ip)
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Send OTP for verification' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto)
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token']
    if (!refreshToken) throw new Error('No refresh token')

    const result = await this.authService.refreshTokens(refreshToken, req.ip, req.headers['user-agent'])
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS)
    res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS)
    return { data: { message: 'Token refreshed' } }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @CurrentUser('id') userId: string) {
    const refreshToken = req.cookies?.['refresh_token']
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    if (refreshToken) await this.authService.logout(refreshToken, userId)
    return { data: { message: 'Logged out successfully' } }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions' })
  async logoutAll(@CurrentUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return this.authService.logoutAll(userId)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId)
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto)
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile fields' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, dto)
  }

  @Post('avatar')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile avatar' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })] }))
    file: Express.Multer.File,
  ) {
    if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Avatar must be JPEG, PNG or WebP')
    }
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '')
    const safeFilename = `${crypto.randomUUID()}${ext}`
    const destDir = path.join(UPLOAD_DIR, 'avatars')
    const localPath = path.join(destDir, safeFilename)
    await fs.mkdir(destDir, { recursive: true })
    await fs.writeFile(localPath, file.buffer)
    return this.authService.updateAvatar(userId, safeFilename)
  }

  @Get('avatar/:filename')
  @ApiOperation({ summary: 'Serve an uploaded avatar' })
  async getAvatar(@Param('filename') filename: string, @Res({ passthrough: true }) res: Response) {
    const safeFilename = path.basename(filename)
    const localPath = path.join(UPLOAD_DIR, 'avatars', safeFilename)
    const ext = path.extname(safeFilename).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    res.set({ 'Content-Type': mimeType })
    return new StreamableFile(fsSync.createReadStream(localPath))
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active sessions' })
  async getSessions(@CurrentUser('id') userId: string, @Req() req: Request) {
    return this.authService.getSessions(userId, req.cookies?.['refresh_token'])
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a session' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.authService.revokeSession(userId, id)
  }

  @Get('notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences' })
  async getNotificationPreferences(@CurrentUser('id') userId: string) {
    return this.authService.getNotificationPreferences(userId)
  }

  @Patch('notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences' })
  async updateNotificationPreferences(@CurrentUser('id') userId: string, @Body() dto: UpdateNotificationPreferenceDto) {
    return this.authService.updateNotificationPreferences(userId, dto)
  }
}
