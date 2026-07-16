export interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Transport-agnostic contract for sending mail. Implementations own the
 * concrete provider (SMTP/Nodemailer, SES, SendGrid, …). Swapping providers is
 * a one-line change in EmailModule — nothing that injects EmailService changes.
 *
 * Contract: `sendMail` must never throw. Delivery failures are logged and
 * swallowed so calling flows (register/login/OTP) are never broken by email.
 */
export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>
}

/** DI token for the active MailProvider implementation. */
export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER')
