import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { InvalidOtpError, TooManyAttemptsError } from '../../domain/auth.errors';
import { OtpPurpose } from '../../domain/token.types';
import { MAILER_PORT, type MailerPort } from '../ports/mailer.port';

import { AppConfigService } from '@/config/app-config.service';
import { RedisService } from '@/infrastructure/redis/redis.service';

/** Result of requesting an OTP. */
export interface OtpRequestResult {
  expiresInSeconds: number;
}

/**
 * One-time password issuing and verification, backed by Redis.
 *
 * Security properties (doc 15):
 * - Only a SHA-256 hash of the code is stored, never the code itself.
 * - Codes auto-expire via Redis TTL.
 * - Rate limited two ways: a resend cooldown and a rolling hourly cap per
 *   identifier, preventing spam and enumeration/brute-force.
 * - A per-code attempt counter invalidates the code after too many wrong tries.
 * - Verification is timing-safe.
 */
@Injectable()
export class OtpService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    @Inject(MAILER_PORT) private readonly mailer: MailerPort,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OtpService.name);
  }

  /**
   * Generate, store, and email a fresh OTP for the given identifier, enforcing
   * cooldown and hourly rate limits.
   */
  async request(identifier: string, purpose: OtpPurpose): Promise<OtpRequestResult> {
    const id = this.normalize(identifier);
    const { ttlSeconds, resendCooldownSeconds, maxPerHour } = this.config.otp;

    // 1. Resend cooldown.
    const cooldownKey = this.key('cooldown', purpose, id);
    const cooldownTtl = await this.redis.ttl(cooldownKey);
    if (cooldownTtl > 0) {
      throw new TooManyAttemptsError('Please wait before requesting another code', cooldownTtl);
    }

    // 2. Rolling hourly cap.
    const countKey = this.key('count', purpose, id);
    const count = await this.redis.incrementWithTtl(countKey, 3600);
    if (count > maxPerHour) {
      const retryAfter = await this.redis.ttl(countKey);
      throw new TooManyAttemptsError(
        'Too many codes requested, please try again later',
        retryAfter > 0 ? retryAfter : 3600,
      );
    }

    // 3. Generate + store the hashed code.
    const code = this.generateCode(this.config.otp.length);
    await this.redis.set(this.key('code', purpose, id), this.hashCode(code), ttlSeconds);
    await this.redis.del(this.key('attempts', purpose, id));
    await this.redis.set(cooldownKey, '1', resendCooldownSeconds);

    // 4. Deliver.
    await this.mailer.send({
      to: identifier,
      subject: 'Your SSC Prep verification code',
      text: `Your verification code is ${code}. It expires in ${Math.floor(
        ttlSeconds / 60,
      )} minutes. If you did not request this, you can ignore this email.`,
    });

    this.logger.info({ purpose }, 'OTP issued');
    return { expiresInSeconds: ttlSeconds };
  }

  /**
   * Verify a submitted code. Throws on failure; deletes the code on success so
   * it cannot be reused.
   */
  async verify(identifier: string, code: string, purpose: OtpPurpose): Promise<void> {
    const id = this.normalize(identifier);
    const codeKey = this.key('code', purpose, id);
    const storedHash = await this.redis.get(codeKey);

    if (!storedHash) {
      throw new InvalidOtpError();
    }

    // Count the attempt; invalidate the code once the ceiling is exceeded.
    const attemptsKey = this.key('attempts', purpose, id);
    const attempts = await this.redis.incrementWithTtl(attemptsKey, this.config.otp.ttlSeconds);
    if (attempts > this.config.otp.maxAttempts) {
      await this.redis.del(codeKey, attemptsKey);
      throw new TooManyAttemptsError('Too many incorrect attempts, request a new code');
    }

    if (!this.hashesEqual(this.hashCode(code), storedHash)) {
      throw new InvalidOtpError();
    }

    await this.redis.del(codeKey, attemptsKey);
  }

  /** Lowercase + trim so `A@b.com ` and `a@b.com` share one bucket. */
  private normalize(identifier: string): string {
    return identifier.trim().toLowerCase();
  }

  private key(kind: string, purpose: OtpPurpose, id: string): string {
    return `otp:${kind}:${purpose}:${id}`;
  }

  /** Cryptographically-secure numeric code of the configured length. */
  private generateCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += randomInt(0, 10).toString();
    }
    return code;
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private hashesEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }
}
