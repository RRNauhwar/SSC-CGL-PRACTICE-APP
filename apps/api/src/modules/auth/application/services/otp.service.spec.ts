import type { Redis } from 'ioredis';
import type { PinoLogger } from 'nestjs-pino';

import { FakeRedis } from '../../../../../test/fakes/redis.fake';
import { InvalidOtpError, TooManyAttemptsError } from '../../domain/auth.errors';
import { OtpPurpose } from '../../domain/token.types';
import type { MailerPort, SendMailInput } from '../ports/mailer.port';

import { OtpService } from './otp.service';

import type { AppConfigService } from '@/config/app-config.service';
import { RedisService } from '@/infrastructure/redis/redis.service';

const otpConfig = {
  otp: {
    length: 6,
    ttlSeconds: 300,
    // 2 allowed attempts => the 3rd wrong try trips the lockout.
    maxAttempts: 2,
    resendCooldownSeconds: 60,
    maxPerHour: 5,
  },
} as unknown as AppConfigService;

const noopLogger = {
  setContext: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  debug: () => undefined,
} as unknown as PinoLogger;

/** Capturing mailer that records the last sent message so tests can read the code. */
class CapturingMailer implements MailerPort {
  last?: SendMailInput;
  send(input: SendMailInput): Promise<void> {
    this.last = input;
    return Promise.resolve();
  }

  extractCode(): string {
    const code = this.last?.text.match(/(\d{6})/)?.[1];
    if (!code) {
      throw new Error('No code found in the sent email');
    }
    return code;
  }
}

describe('OtpService', () => {
  let redis: RedisService;
  let mailer: CapturingMailer;
  let service: OtpService;
  const email = 'aspirant@example.com';

  beforeEach(() => {
    redis = new RedisService(new FakeRedis() as unknown as Redis);
    mailer = new CapturingMailer();
    service = new OtpService(redis, otpConfig, mailer, noopLogger);
  });

  it('issues a code and verifies it successfully', async () => {
    const result = await service.request(email, OtpPurpose.LOGIN);
    expect(result.expiresInSeconds).toBe(300);

    const code = mailer.extractCode();
    await expect(service.verify(email, code, OtpPurpose.LOGIN)).resolves.toBeUndefined();
  });

  it('invalidates the code after a successful verification (no reuse)', async () => {
    await service.request(email, OtpPurpose.LOGIN);
    const code = mailer.extractCode();

    await service.verify(email, code, OtpPurpose.LOGIN);
    await expect(service.verify(email, code, OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      InvalidOtpError,
    );
  });

  it('rejects an incorrect code', async () => {
    await service.request(email, OtpPurpose.LOGIN);
    await expect(service.verify(email, '000000', OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      InvalidOtpError,
    );
  });

  it('enforces the resend cooldown', async () => {
    await service.request(email, OtpPurpose.LOGIN);
    await expect(service.request(email, OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      TooManyAttemptsError,
    );
  });

  it('locks the code after too many wrong attempts', async () => {
    await service.request(email, OtpPurpose.LOGIN);
    // maxAttempts = 3: three wrong tries, the third trips the lockout.
    await expect(service.verify(email, '111111', OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      InvalidOtpError,
    );
    await expect(service.verify(email, '222222', OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      InvalidOtpError,
    );
    await expect(service.verify(email, '333333', OtpPurpose.LOGIN)).rejects.toBeInstanceOf(
      TooManyAttemptsError,
    );
  });
});
