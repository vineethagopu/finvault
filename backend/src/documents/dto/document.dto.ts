import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

// Mirrors the Prisma `DocumentCategory` enum exactly (schema.prisma) — do not drift from it.
export enum DocumentCategory {
  INSURANCE = 'INSURANCE',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN',
  KYC = 'KYC',
  INCOME = 'INCOME',
  TAX = 'TAX',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional() @IsOptional() @IsEnum(DocumentCategory) category?: DocumentCategory
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string
  @ApiPropertyOptional() @IsOptional() @IsString() policyId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() loanId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() docType?: string
}

export class DocumentFiltersDto {
  @IsOptional() @IsString() category?: string
  @IsOptional() @IsString() search?: string
  @IsOptional() @IsString() page?: string
  @IsOptional() @IsString() limit?: string
}
