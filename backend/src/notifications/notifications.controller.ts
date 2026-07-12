import { Controller, Get, Patch, Delete, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get() findAll(@CurrentUser('id') uid: string, @Query() q: any) { return this.service.findAll(uid, q) }
  @Patch('read-all') @HttpCode(HttpStatus.OK) markAllRead(@CurrentUser('id') uid: string) { return this.service.markAllRead(uid) }
  @Patch(':id/read') @HttpCode(HttpStatus.OK) markRead(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.markRead(uid, id) }
  @Delete(':id') @HttpCode(HttpStatus.OK) delete(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.delete(uid, id) }
}
