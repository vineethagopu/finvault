/**
 * Transport-agnostic contract for sending SMS. Implementations own the concrete
 * provider (Twilio, MSG91, …). Swapping providers is a one-line change in
 * SmsModule — nothing that injects SmsService changes.
 *
 * Contract: `sendSms` must never throw. Delivery failures are logged and
 * swallowed so calling flows (register/login/OTP) are never broken by SMS.
 */
export interface SmsProvider {
  sendSms(to: string, body: string): Promise<void>

  /**
   * True once a real provider is actually configured — callers use this to
   * decide whether a dev-only fallback (e.g. an OTP echoed back to the client)
   * is still needed.
   */
  readonly usingRealProvider: boolean
}

/** DI token for the active SmsProvider implementation. */
export const SMS_PROVIDER = Symbol('SMS_PROVIDER')
