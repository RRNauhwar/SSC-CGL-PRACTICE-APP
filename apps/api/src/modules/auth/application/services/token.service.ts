import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InvalidTokenError } from '../../domain/auth.errors';
import type {
  AccessTokenClaims,
  RefreshTokenClaims,
  VerifiedAccessToken,
  VerifiedRefreshToken,
} from '../../domain/token.types';

import { AppConfigService } from '@/config/app-config.service';

/**
 * Issues and verifies JWT access and refresh tokens.
 *
 * Security properties (doc 15):
 * - Access and refresh tokens are signed with **distinct** secrets, so a leaked
 *   access token can never be replayed as a refresh token.
 * - Every token carries a `type` claim that is checked on verification, and
 *   `iss`/`aud` claims that must match this deployment.
 * - Verification failures always surface as {@link InvalidTokenError} (401),
 *   never leaking the underlying JWT error.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  /** Access-token lifetime in seconds — clients use this to schedule refreshes. */
  get accessTtlSeconds(): number {
    return this.config.auth.accessTtlSeconds;
  }

  get refreshTtlSeconds(): number {
    return this.config.auth.refreshTtlSeconds;
  }

  signAccessToken(userId: string, sessionId: string, roles: string[]): Promise<string> {
    const claims: AccessTokenClaims = { sub: userId, sid: sessionId, roles, type: 'access' };
    return this.jwt.signAsync(claims, {
      secret: this.config.auth.accessSecret,
      expiresIn: this.accessTtlSeconds,
      issuer: this.config.auth.issuer,
      audience: this.config.auth.audience,
    });
  }

  signRefreshToken(userId: string, sessionId: string, familyId: string): Promise<string> {
    const claims: RefreshTokenClaims = {
      sub: userId,
      sid: sessionId,
      fid: familyId,
      type: 'refresh',
    };
    return this.jwt.signAsync(claims, {
      secret: this.config.auth.refreshSecret,
      expiresIn: this.refreshTtlSeconds,
      issuer: this.config.auth.issuer,
      audience: this.config.auth.audience,
    });
  }

  async verifyAccessToken(token: string): Promise<VerifiedAccessToken> {
    const payload = await this.verify<VerifiedAccessToken>(token, this.config.auth.accessSecret);
    if (payload.type !== 'access') {
      throw new InvalidTokenError();
    }
    return payload;
  }

  async verifyRefreshToken(token: string): Promise<VerifiedRefreshToken> {
    const payload = await this.verify<VerifiedRefreshToken>(token, this.config.auth.refreshSecret);
    if (payload.type !== 'refresh') {
      throw new InvalidTokenError();
    }
    return payload;
  }

  private async verify<T extends object>(token: string, secret: string): Promise<T> {
    try {
      return await this.jwt.verifyAsync<T>(token, {
        secret,
        issuer: this.config.auth.issuer,
        audience: this.config.auth.audience,
      });
    } catch {
      throw new InvalidTokenError();
    }
  }
}
