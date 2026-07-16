import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import nodemailer, { Transporter } from 'nodemailer'
import { MailProvider, SendMailOptions } from './email.provider'

/**
 * Nodemailer-backed MailProvider.
 *
 * Uses SMTP when SMTP_HOST is configured, otherwise falls back to Ethereal, a
 * free disposable test inbox (auto-provisioned, no signup) whose sends never
 * leave Ethereal and log a preview URL. Delivery failures are logged and
 * swallowed per the MailProvider contract.
 */
@Injectable()
export class NodemailerMailProvider implements MailProvider, OnModuleInit {
  private readonly logger = new Logger(NodemailerMailProvider.name)
  private transporter: Transporter | null = null
  private fromAddress = process.env.SMTP_FROM || 'PolicyNext <noreply@policynext.com>'
  private usingEthereal = false

  async onModuleInit() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
      this.logger.log(`Email transport: SMTP (${process.env.SMTP_HOST})`)
      return
    }

    // No SMTP configured — fall back to Ethereal, a free disposable test
    // inbox (auto-provisioned, no signup). Sent mail never leaves Ethereal;
    // each send logs a preview URL to view the rendered email in a browser.
    try {
      const testAccount = await nodemailer.createTestAccount()
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      })
      this.usingEthereal = true
      this.fromAddress = `PolicyNext <${testAccount.user}>`
      this.logger.log('Email transport: Ethereal test inbox (no SMTP_HOST configured)')
    } catch (err) {
      this.logger.warn(
        `Could not provision Ethereal test account, emails will be logged only: ${(err as Error).message}`,
      )
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[email skipped, no transport] to=${options.to} subject="${options.subject}"`)
      return
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      if (this.usingEthereal) {
        this.logger.log(`Email sent — preview: ${nodemailer.getTestMessageUrl(info)}`)
      } else {
        this.logger.log(`Email sent to ${options.to} (${info.messageId})`)
      }
    } catch (err) {
      // Email delivery must never break the calling flow (register/login/OTP).
      this.logger.error(`Failed to send email to ${options.to}: ${(err as Error).message}`)
    }
  }
}
