import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { ReportsService } from './reports.service'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('summary')
  getSummary(@CurrentUser('id') uid: string) { return this.service.getSummary(uid) }

  @Get('net-worth-trend')
  getNetWorthTrend(@CurrentUser('id') uid: string) { return this.service.getNetWorthTrend(uid) }

  @Get('premium-trend')
  getPremiumTrend(@CurrentUser('id') uid: string) { return this.service.getPremiumTrend(uid) }

  @Get('tax-summary')
  getTaxSummary(@CurrentUser('id') uid: string) { return this.service.getTaxSummary(uid) }
}
