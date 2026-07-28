import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { BeneficiaryType } from '@prisma/client'

export class CreateBeneficiaryDto {
  @ApiProperty() @IsString() fullName: string
  @ApiProperty() @IsString() relationship: string
  @ApiProperty() @IsNumber() @Min(0) @Max(100) sharePercent: number
  @ApiPropertyOptional({ enum: BeneficiaryType }) @IsOptional() @IsEnum(BeneficiaryType) type?: BeneficiaryType
  @ApiPropertyOptional() @IsOptional() @IsString() policyId?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string
  @ApiPropertyOptional() @IsOptional() @IsString() mobile?: string
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string
  @ApiPropertyOptional() @IsOptional() @IsString() aadhaarNumber?: string
  @ApiPropertyOptional() @IsOptional() @IsString() pan?: string
}

export class UpdateBeneficiaryDto extends PartialType(CreateBeneficiaryDto) {}
