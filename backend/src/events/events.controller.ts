import { Controller, Sse, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { Observable } from 'rxjs'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { EventsService, AppEvent } from './events.service'

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * Long-lived SSE stream of this user's realtime events. The browser's
   * EventSource authenticates with the existing JWT cookie and auto-reconnects.
   */
  @Sse('stream')
  stream(@CurrentUser('id') userId: string): Observable<{ data: AppEvent }> {
    return this.events.streamFor(userId)
  }
}
