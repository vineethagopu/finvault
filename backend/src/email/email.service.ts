import { Inject, Injectable } from '@nestjs/common'
import { MAIL_PROVIDER } from './email.provider'
import type { MailProvider, SendMailOptions } from './email.provider'

export type { SendMailOptions } from './email.provider'

/**
 * Public mail façade injected across the app. Delegates to the configured
 * MailProvider so callers depend only on this stable surface, never on the
 * concrete transport (Nodemailer/SMTP/Ethereal/…).
 */
@Injectable()
export class EmailService {
  constructor(@Inject(MAIL_PROVIDER) private readonly provider: MailProvider) {}

  sendMail(options: SendMailOptions): Promise<void> {
    return this.provider.sendMail(options)
  }
}
