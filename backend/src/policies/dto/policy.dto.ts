import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

class NomineeDto {
  @IsString() fullName: string
  @IsString() relationship: string
  @IsOptional() @IsDateString() dateOfBirth?: string
  @IsNumber() @Min(0) @Max(100) sharePercent: number
  @IsOptional() @IsString() mobile?: string
  @IsOptional() @IsString() address?: string
}

export class CreatePolicyDto {
  @ApiProperty() @IsString() policyName: string
  @ApiPropertyOptional() @IsOptional() @IsString() policyNumber?: string
  @ApiProperty() @IsString() insuranceType: string
  @ApiProperty() @IsString() provider: string
  @ApiProperty() @IsNumber() @Min(0) sumAssured: number
  @ApiProperty() @IsNumber() @Min(0) premiumAmount: number
  @ApiPropertyOptional() @IsOptional() @IsString() premiumFrequency?: string
  @ApiProperty() @IsDateString() policyStartDate: string
  @ApiProperty() @IsDateString() policyEndDate: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextPremiumDate?: string
  @ApiPropertyOptional() @IsOptional() @IsNumber() policyTerm?: number
  @ApiPropertyOptional() @IsOptional() @IsString() agentName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() agentContact?: string
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string

  @ApiPropertyOptional({ type: [NomineeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NomineeDto)
  nominees?: NomineeDto[]
}

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}

export class PolicyFiltersDto {
  @IsOptional() @IsString() insuranceType?: string
  @IsOptional() @IsString() status?: string
  @IsOptional() @IsString() search?: string
  @IsOptional() @IsNumber() @Min(1) page?: number
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number
}
