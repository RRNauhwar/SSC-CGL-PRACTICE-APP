import { Injectable } from '@nestjs/common';
import { AuthProvider, UserStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import {
  AccountExistsError,
  AccountNotActiveError,
  InvalidCredentialsError,
  InvalidTokenError,
  TooManyAttemptsError,
} from '../../domain/auth.errors';
import { Role } from '../../domain/roles';
import { OtpPurpose, type RequestContext, type TokenPair } from '../../domain/token.types';
import { GoogleTokenVerifier } from '../../infrastructure/google/google-token-verifier';
import {
  AuthUserRepository,
  passwordHashOf,
  roleNamesOf,
  type AuthUserRecord,
} from '../../infrastructure/repositories/auth-user.repository';
import type { AuthResult, UserProfile } from '../dto/auth-response.dto';
import type { LoginDto, RegisterDto, RequestOtpDto, VerifyOtpDto } from '../dto/auth.dto';

import { OtpService, type OtpRequestResult } from './otp.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';

import { AppConfigService } from '@/config/app-config.service';
import { RedisService } from '@/infrastructure/redis/redis.service';

/**
 * Orchestrates the authentication use cases (register, password login, email
 * OTP, Google login, refresh, logout, profile). It coordinates the focused
 * services (password, token/session, OTP, Google) and repositories, keeping
 * each concern single-responsibility.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly otp: OtpService,
    private readonly google: GoogleTokenVerifier,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  // --- Registration & password login ---------------------------------------

  async register(dto: RegisterDto, context: RequestContext): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new AccountExistsError();
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.users.createUser({
      email: dto.email,
      name: dto.name,
      roleName: Role.LEARNER,
      credential: { provider: AuthProvider.PASSWORD, passwordHash },
    });

    this.logger.info({ userId: user.id }, 'User registered (password)');
    return this.buildAuthResult(user, context);
  }

  async login(dto: LoginDto, context: RequestContext): Promise<AuthResult> {
    await this.assertNotLockedOut(dto.email);

    const user = await this.users.findByEmail(dto.email);
    const hash = user ? passwordHashOf(user) : null;

    // Verify even when the user/hash is missing is not possible; still, always
    // fail with the same generic error to avoid account enumeration.
    const passwordValid = hash ? await this.passwords.verify(hash, dto.password) : false;

    if (!user || !hash || !passwordValid) {
      await this.recordFailedLogin(dto.email);
      throw new InvalidCredentialsError();
    }

    this.assertActive(user);
    await this.clearFailedLogins(dto.email);
    return this.buildAuthResult(user, context);
  }

  // --- Email OTP (passwordless) ---------------------------------------------

  async requestOtp(dto: RequestOtpDto): Promise<OtpRequestResult> {
    // Always issue (even for unknown emails) so callers cannot enumerate accounts.
    return this.otp.request(dto.email, OtpPurpose.LOGIN);
  }

  async verifyOtp(dto: VerifyOtpDto, context: RequestContext): Promise<AuthResult> {
    await this.otp.verify(dto.email, dto.code, OtpPurpose.LOGIN);

    let user = await this.users.findByEmail(dto.email);
    if (user) {
      this.assertActive(user);
    } else {
      // Verified email with no account => passwordless sign-up.
      user = await this.users.createUser({
        email: dto.email,
        roleName: Role.LEARNER,
        credential: { provider: AuthProvider.EMAIL_OTP },
      });
      this.logger.info({ userId: user.id }, 'User registered (email OTP)');
    }

    return this.buildAuthResult(user, context);
  }

  // --- Google sign-in --------------------------------------------------------

  async googleLogin(idToken: string, context: RequestContext): Promise<AuthResult> {
    const identity = await this.google.verify(idToken);

    let user = await this.users.findByProvider(AuthProvider.GOOGLE, identity.sub);

    if (!user) {
      const byEmail = await this.users.findByEmail(identity.email);
      if (byEmail) {
        // Link Google to the existing account.
        await this.users.addCredential(byEmail.id, {
          provider: AuthProvider.GOOGLE,
          providerUid: identity.sub,
        });
        user = await this.users.findById(byEmail.id);
      } else {
        user = await this.users.createUser({
          email: identity.email,
          name: identity.name,
          roleName: Role.LEARNER,
          credential: { provider: AuthProvider.GOOGLE, providerUid: identity.sub },
        });
        this.logger.info({ userId: user.id }, 'User registered (Google)');
      }
    }

    if (!user) {
      throw new InvalidTokenError('Google sign-in failed');
    }
    this.assertActive(user);
    return this.buildAuthResult(user, context);
  }

  // --- Token lifecycle -------------------------------------------------------

  async refresh(refreshToken: string, context: RequestContext): Promise<TokenPair> {
    const { userId, familyId } = await this.sessions.validateAndRotate(refreshToken);

    const user = await this.users.findById(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      // The account vanished or was deactivated since the token was issued.
      throw new InvalidTokenError('Session is no longer valid, please sign in again');
    }

    return this.sessions.issueTokens(user.id, roleNamesOf(user), context, familyId);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revokeSession(sessionId, 'LOGOUT');
  }

  async logoutAll(userId: string, exceptSessionId?: string): Promise<number> {
    return this.sessions.revokeAll(userId, exceptSessionId);
  }

  // --- Profile & sessions ----------------------------------------------------

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new InvalidTokenError();
    }
    return this.toProfile(user);
  }

  // --- Helpers ---------------------------------------------------------------

  private async buildAuthResult(
    user: AuthUserRecord,
    context: RequestContext,
  ): Promise<AuthResult> {
    const tokens = await this.sessions.issueTokens(user.id, roleNamesOf(user), context);
    return { user: this.toProfile(user), tokens };
  }

  private toProfile(user: AuthUserRecord): UserProfile {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      handle: user.handle,
      locale: user.locale,
      status: user.status,
      roles: roleNamesOf(user),
    };
  }

  private assertActive(user: AuthUserRecord): void {
    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
      throw new AccountNotActiveError();
    }
  }

  // --- Password brute-force protection (Redis-backed) ------------------------

  private failKey(email: string): string {
    return `login:fail:${email.trim().toLowerCase()}`;
  }

  private async assertNotLockedOut(email: string): Promise<void> {
    const key = this.failKey(email);
    const attempts = Number((await this.redis.get(key)) ?? '0');
    if (attempts >= this.config.loginSecurity.maxAttempts) {
      const retryAfter = await this.redis.ttl(key);
      throw new TooManyAttemptsError(
        'Too many failed attempts, please try again later',
        retryAfter > 0 ? retryAfter : this.config.loginSecurity.lockoutSeconds,
      );
    }
  }

  private async recordFailedLogin(email: string): Promise<void> {
    await this.redis.incrementWithTtl(
      this.failKey(email),
      this.config.loginSecurity.lockoutSeconds,
    );
  }

  private async clearFailedLogins(email: string): Promise<void> {
    await this.redis.del(this.failKey(email));
  }
}
