import { Global, Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { MAIL_PROVIDER } from './email.provider'
import { NodemailerMailProvider } from './nodemailer.provider'

/**
 * Wires the active MailProvider. To switch providers (SES, SendGrid, …),
 * implement MailProvider and change the single `useClass` below — no caller
 * of EmailService changes.
 */
@Global()
@Module({
  providers: [
    EmailService,
    { provide: MAIL_PROVIDER, useClass: NodemailerMailProvider },
  ],
  exports: [EmailService],
})
export class EmailModule {}
