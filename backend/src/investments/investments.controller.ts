import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { InvestmentsService } from './investments.service'
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto'

@ApiTags('Investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private service: InvestmentsService) {}

  @Get() findAll(@CurrentUser('id') uid: string, @Query() q: any) { return this.service.findAll(uid, q) }
  @Get('overview') getOverview(@CurrentUser('id') uid: string) { return this.service.getOverview(uid) }
  @Get('performance') getPerformance(@CurrentUser('id') uid: string) { return this.service.getPerformance(uid) }
  @Get(':id') findOne(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.findOne(uid, id) }
  @Post() create(@CurrentUser('id') uid: string, @Body() dto: CreateInvestmentDto) { return this.service.create(uid, dto) }
  @Patch(':id') update(@CurrentUser('id') uid: string, @Param('id') id: string, @Body() dto: UpdateInvestmentDto) { return this.service.update(uid, id, dto) }
  @Delete(':id') @HttpCode(HttpStatus.OK) remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id) }
}
