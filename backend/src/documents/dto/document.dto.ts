import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export enum DocumentCategory {
  POLICY = 'POLICY',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN',
  IDENTITY = 'IDENTITY',
  TAX = 'TAX',
  MEDICAL = 'MEDICAL',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional() @IsOptional() @IsEnum(DocumentCategory) category?: DocumentCategory
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string
}

export class DocumentFiltersDto {
  @IsOptional() @IsString() category?: string
  @IsOptional() @IsString() search?: string
  @IsOptional() @IsString() page?: string
  @IsOptional() @IsString() limit?: string
}
