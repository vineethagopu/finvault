import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  getSummary(@CurrentUser('id') uid: string) {
    return this.service.getSummary(uid)
  }

  @Get('stats')
  @ApiQuery({ name: 'month', required: false, example: 'May 2025' })
  getStats(@CurrentUser('id') uid: string, @Query('month') month?: string) {
    return this.service.getStats(uid, month)
  }
}
