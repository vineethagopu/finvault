import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { BeneficiariesService } from './beneficiaries.service'

@ApiTags('Beneficiaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private service: BeneficiariesService) {}

  @Get() findAll(@CurrentUser('id') uid: string) { return this.service.findAll(uid) }
  @Get('summary') getSummary(@CurrentUser('id') uid: string) { return this.service.getSummary(uid) }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: any) { return this.service.create(uid, dto) }
  @Patch(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: any) { return this.service.update(uid, id, dto) }
  @Delete(':id') @HttpCode(HttpStatus.OK) remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id) }
}
