import { Global, Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'

/**
 * Global so any feature module can inject EventsService to push realtime
 * events without importing this module explicitly.
 */
@Global()
@Module({
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
