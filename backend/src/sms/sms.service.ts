import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import twilio, { Twilio } from 'twilio'

@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name)
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

  /** True once Twilio is actually configured — callers use this to decide whether a dev-only fallback (e.g. an OTP code echoed back to the client) is still needed. */
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
