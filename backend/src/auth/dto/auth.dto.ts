import {
  IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional, IsBoolean, IsIn,
  ArrayMinSize, ArrayMaxSize, ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'ravi.sharma' })
  @IsString()
  username: string

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @MinLength(8)
  password: string
}

export class OtpLoginDto {
  @ApiProperty({ example: '+919876543210 or user@email.com' })
  @IsString()
  identifier: string
}

export class VerifyOtpLoginDto {
  @ApiProperty()
  @IsString()
  identifier: string

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username: only letters, numbers, underscores' })
  username: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter valid 10-digit mobile number' })
  mobile: string

  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  lastName: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain letters, numbers, and symbols',
  })
  password: string

  @ApiPropertyOptional({ enum: ['INDIVIDUAL', 'FAMILY'] })
  @IsOptional()
  @IsIn(['INDIVIDUAL', 'FAMILY'])
  planType?: string
}

export class FamilyMemberDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username: only letters, numbers, underscores' })
  username: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter valid 10-digit mobile number' })
  mobile: string

  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  lastName: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain letters, numbers, and symbols',
  })
  password: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string
}

export class RegisterFamilyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyName?: string

  @ApiProperty({ type: [FamilyMemberDto] })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDto)
  members: FamilyMemberDto[]
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@email.com or 9876543210' })
  @IsString()
  contactInfo: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string
}

export class VerifyOtpDto {
  @ApiProperty({ enum: ['EMAIL', 'MOBILE', 'TWO_FA'] })
  @IsIn(['EMAIL', 'MOBILE', 'TWO_FA'])
  type: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string

  @ApiProperty()
  @IsString()
  identifier: string
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  newPassword: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  newPassword: string
}

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) firstName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) lastName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() dateOfBirth?: string
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() occupation?: string
  @ApiPropertyOptional() @IsOptional() annualIncome?: number
}

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() premiumDue?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() emiDue?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() policyExpiry?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() investmentAlerts?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() weeklyDigest?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() monthlyReport?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() promotions?: boolean
  @ApiPropertyOptional() @IsOptional() @IsBoolean() securityAlerts?: boolean
}
