import { Inject, Injectable } from '@nestjs/common'
import { SMS_PROVIDER } from './sms.provider'
import type { SmsProvider } from './sms.provider'

/**
 * Public SMS façade injected across the app. Delegates to the configured
 * SmsProvider so callers depend only on this stable surface, never on the
 * concrete transport (Twilio/MSG91/…).
 */
@Injectable()
export class SmsService {
  constructor(@Inject(SMS_PROVIDER) private readonly provider: SmsProvider) {}

  /** True once a real provider is configured (see SmsProvider.usingRealProvider). */
  get usingRealProvider(): boolean {
    return this.provider.usingRealProvider
  }

  sendSms(to: string, body: string): Promise<void> {
    return this.provider.sendSms(to, body)
  }
}
