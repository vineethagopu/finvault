import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { InvestmentType, AssetClass } from '@prisma/client'

export class CreateInvestmentDto {
  @ApiProperty() @IsString() investmentName: string
  @ApiProperty({ enum: InvestmentType }) @IsEnum(InvestmentType) investmentType: InvestmentType
  @ApiProperty() @IsString() provider: string
  @ApiPropertyOptional({ enum: AssetClass }) @IsOptional() @IsEnum(AssetClass) assetClass?: AssetClass
  @ApiPropertyOptional() @IsOptional() @IsString() riskLevel?: string
  @ApiProperty() @IsNumber() @Min(0) amountInvested: number
  @ApiProperty() @IsNumber() @Min(0) currentValue: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() units?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() nav?: number
  @ApiPropertyOptional() @IsOptional() @IsString() folioNumber?: string
  @ApiProperty() @IsDateString() investmentDate: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() maturityDate?: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() returnPercent?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() returnAmount?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() sipAmount?: number
  @ApiPropertyOptional() @IsOptional() @IsNumber() sipDay?: number
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isSip?: boolean
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string
}

export class UpdateInvestmentDto extends PartialType(CreateInvestmentDto) {}
