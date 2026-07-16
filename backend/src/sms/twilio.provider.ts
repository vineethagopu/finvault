import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import twilio, { Twilio } from 'twilio'
import { SmsProvider } from './sms.provider'

/**
 * Twilio-backed SmsProvider. Sends via Twilio when SID/token/from are
 * configured, otherwise logs the message to the console. Delivery failures are
 * logged and swallowed per the SmsProvider contract.
 */
@Injectable()
export class TwilioSmsProvider implements SmsProvider, OnModuleInit {
  private readonly logger = new Logger(TwilioSmsProvider.name)
  private client: Twilio | null = null
  private fromNumber = process.env.TWILIO_FROM

  onModuleInit() {
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
      this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
      this.logger.log('SMS transport: Twilio')
    } else {
      this.logger.log('SMS transport: console-only (no TWILIO_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM configured)')
    }
  }

  /** True once Twilio is actually configured. */
  get usingRealProvider(): boolean {
    return this.client !== null
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.client) {
      this.logger.log(`[sms skipped, no transport] to=${to} body="${body}"`)
      return
    }

    const toE164 = to.startsWith('+') ? to : `+91${to}`

    try {
      const message = await this.client.messages.create({ to: toE164, from: this.fromNumber, body })
      this.logger.log(`SMS sent to ${to} (sid=${message.sid})`)
    } catch (err) {
      // SMS delivery must never break the calling flow (register/login/OTP), same contract as EmailService.
      this.logger.error(`Failed to send SMS to ${to}: ${(err as Error).message}`)
    }
  }
}
