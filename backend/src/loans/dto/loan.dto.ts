import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { LoanType } from '@prisma/client'

export class CreateLoanDto {
  @ApiProperty() @IsString() loanName: string
  @ApiProperty({ enum: LoanType }) @IsEnum(LoanType) loanType: LoanType
  @ApiProperty() @IsString() lender: string
  @ApiPropertyOptional() @IsOptional() @IsString() accountNumber?: string
  @ApiPropertyOptional() @IsOptional() @IsString() securedByPolicyId?: string
  @ApiProperty() @IsNumber() @Min(0) principalAmount: number
  @ApiProperty() @IsNumber() @Min(0) outstandingAmount: number
  @ApiProperty() @IsNumber() @Min(0) emiAmount: number
  @ApiProperty() @IsNumber() @Min(0) interestRate: number
  @ApiProperty() @IsNumber() @Min(1) tenure: number
  @ApiProperty() @IsNumber() @Min(0) remainingTenure: number
  @ApiProperty() @IsNumber() @Min(1) emiDay: number
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextEmiDate?: string
  @ApiProperty() @IsDateString() disbursedDate: string
  // Optional here even though required by the schema — the service derives it
  // from disbursedDate + tenure when the caller omits or mis-sends it.
  @ApiPropertyOptional() @IsOptional() @IsDateString() maturityDate?: string
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string
  @ApiPropertyOptional() @IsOptional() @IsString() interestType?: string
  @ApiPropertyOptional() @IsOptional() @IsString() repaymentFrequency?: string
  @ApiPropertyOptional() @IsOptional() @IsString() securityType?: string
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string
}

export class UpdateLoanDto extends PartialType(CreateLoanDto) {}
