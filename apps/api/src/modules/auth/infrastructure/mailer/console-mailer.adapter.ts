import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import type { MailerPort, SendMailInput } from '../../application/ports/mailer.port';

import { AppConfigService } from '@/config/app-config.service';

/**
 * Development mailer that writes messages to the structured log instead of
 * sending real email. Lets the full OTP flow work end-to-end locally without an
 * email provider. A production SMTP/SES adapter implements the same
 * {@link MailerPort} and is selected via `MAIL_TRANSPORT` (see AuthModule).
 */
@Injectable()
export class ConsoleMailerAdapter implements MailerPort {
  constructor(
    private readonly logger: PinoLogger,
    private readonly config: AppConfigService,
  ) {
    this.logger.setContext(ConsoleMailerAdapter.name);
  }

  send(input: SendMailInput): Promise<void> {
    this.logger.info(
      { from: this.config.mail.from, to: input.to, subject: input.subject, body: input.text },
      'Outgoing email (console transport)',
    );
    return Promise.resolve();
  }
}
