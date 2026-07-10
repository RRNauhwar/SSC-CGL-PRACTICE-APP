import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PinoLogger } from 'nestjs-pino';

import { AuthMethodUnavailableError, InvalidTokenError } from '../../domain/auth.errors';

import { AppConfigService } from '@/config/app-config.service';

/** Verified identity extracted from a Google ID token. */
export interface GoogleIdentity {
  /** Google's stable subject identifier for the account. */
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

/**
 * Verifies Google ID tokens for Google Sign-In.
 *
 * The web/mobile client performs the Google sign-in and posts the resulting ID
 * token; the server verifies its signature and audience against the configured
 * `GOOGLE_CLIENT_ID`. If Google login is not configured for this deployment,
 * calls fail with a clear, safe error.
 */
@Injectable()
export class GoogleTokenVerifier {
  private readonly client?: OAuth2Client;

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GoogleTokenVerifier.name);
    if (this.config.google.enabled) {
      this.client = new OAuth2Client(this.config.google.clientId);
    }
  }

  async verify(idToken: string): Promise<GoogleIdentity> {
    if (!this.client || !this.config.google.clientId) {
      throw new AuthMethodUnavailableError('Google sign-in is not configured');
    }

    let payload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.google.clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn({ err: error }, 'Google ID token verification failed');
      throw new InvalidTokenError('Google sign-in failed');
    }

    if (!payload?.sub || !payload.email) {
      throw new InvalidTokenError('Google sign-in failed');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? false,
      name: payload.name,
    };
  }
}
