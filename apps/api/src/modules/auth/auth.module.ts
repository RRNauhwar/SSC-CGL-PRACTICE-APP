import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';

import { MAILER_PORT, type MailerPort } from './application/ports/mailer.port';
import { AuthService } from './application/services/auth.service';
import { OtpService } from './application/services/otp.service';
import { PasswordService } from './application/services/password.service';
import { SessionService } from './application/services/session.service';
import { TokenService } from './application/services/token.service';
import { GoogleTokenVerifier } from './infrastructure/google/google-token-verifier';
import { ConsoleMailerAdapter } from './infrastructure/mailer/console-mailer.adapter';
import { AuthUserRepository } from './infrastructure/repositories/auth-user.repository';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { AuthController } from './interface/auth.controller';
import { JwtAuthGuard } from './interface/guards/jwt-auth.guard';
import { RolesGuard } from './interface/guards/roles.guard';
import { SessionController } from './interface/session.controller';

import { AppConfigService } from '@/config/app-config.service';

/**
 * Authentication & Authorization bounded context.
 *
 * Wires the auth use cases and registers two global guards (secure by default):
 * {@link JwtAuthGuard} authenticates every request unless `@Public()`, then
 * {@link RolesGuard} enforces `@Roles()`. Guard order is guaranteed because
 * JwtAuthGuard is declared first.
 *
 * The mailer implementation is selected from configuration via a factory,
 * keeping the concrete transport out of business logic.
 */
@Module({
  imports: [
    // JwtService is used for signing/verifying; secrets are passed per-call in
    // TokenService, so no static secret is registered here.
    JwtModule.register({}),
  ],
  controllers: [AuthController, SessionController],
  providers: [
    // Application services
    AuthService,
    TokenService,
    PasswordService,
    OtpService,
    SessionService,
    // Infrastructure
    AuthUserRepository,
    SessionRepository,
    GoogleTokenVerifier,
    ConsoleMailerAdapter,
    {
      provide: MAILER_PORT,
      inject: [AppConfigService, ConsoleMailerAdapter, PinoLogger],
      useFactory: (
        config: AppConfigService,
        consoleMailer: ConsoleMailerAdapter,
        logger: PinoLogger,
      ): MailerPort => {
        if (config.mail.transport === 'smtp') {
          // SMTP adapter is introduced when a provider is provisioned; until
          // then we fail safe to the console transport rather than silently
          // dropping mail.
          logger.setContext('AuthModule');
          logger.warn('MAIL_TRANSPORT=smtp is not yet implemented; using console transport');
        }
        return consoleMailer;
      },
    },
    // Global guards (order matters: authenticate, then authorize).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [TokenService],
})
export class AuthModule {}
