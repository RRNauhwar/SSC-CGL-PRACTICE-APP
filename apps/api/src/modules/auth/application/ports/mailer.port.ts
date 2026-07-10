/**
 * Outbound port for sending transactional email.
 *
 * The auth module depends on this abstraction, not a concrete provider
 * (dependency inversion). A console adapter is used in development; an SMTP/SES
 * adapter can be swapped in via configuration without touching business logic.
 */

export interface SendMailInput {
  to: string;
  subject: string;
  /** Plain-text body (always provided as a fallback). */
  text: string;
  /** Optional HTML body. */
  html?: string;
}

export interface MailerPort {
  send(input: SendMailInput): Promise<void>;
}

/** DI token for {@link MailerPort} implementations. */
export const MAILER_PORT = 'MAILER_PORT';
