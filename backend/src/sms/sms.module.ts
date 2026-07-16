import { Global, Module } from '@nestjs/common'
import { SmsService } from './sms.service'
import { SMS_PROVIDER } from './sms.provider'
import { TwilioSmsProvider } from './twilio.provider'

/**
 * Wires the active SmsProvider. To switch providers (MSG91, …), implement
 * SmsProvider and change the single `useClass` below — no caller of SmsService
 * changes.
 */
@Global()
@Module({
  providers: [
    SmsService,
    { provide: SMS_PROVIDER, useClass: TwilioSmsProvider },
  ],
  exports: [SmsService],
})
export class SmsModule {}
