import { JwtService } from '@nestjs/jwt';

import { InvalidTokenError } from '../../domain/auth.errors';

import { TokenService } from './token.service';

import type { AppConfigService } from '@/config/app-config.service';

/** Minimal AppConfigService stand-in exposing only the `auth` group. */
const config = {
  auth: {
    accessSecret: 'a'.repeat(32),
    refreshSecret: 'b'.repeat(32),
    accessTtlSeconds: 900,
    refreshTtlSeconds: 1209600,
    issuer: 'ssc-prep',
    audience: 'ssc-prep-clients',
  },
} as unknown as AppConfigService;

describe('TokenService', () => {
  const service = new TokenService(new JwtService({}), config);

  it('signs and verifies an access token with its claims', async () => {
    const token = await service.signAccessToken('user-1', 'session-1', ['learner']);
    const payload = await service.verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.sid).toBe('session-1');
    expect(payload.roles).toEqual(['learner']);
    expect(payload.type).toBe('access');
    expect(payload.iss).toBe('ssc-prep');
    expect(payload.aud).toBe('ssc-prep-clients');
  });

  it('signs and verifies a refresh token with its family id', async () => {
    const token = await service.signRefreshToken('user-1', 'session-1', 'family-1');
    const payload = await service.verifyRefreshToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.fid).toBe('family-1');
    expect(payload.type).toBe('refresh');
  });

  it('rejects an access token when verified as a refresh token (distinct secrets)', async () => {
    const access = await service.signAccessToken('user-1', 'session-1', []);
    await expect(service.verifyRefreshToken(access)).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it('rejects a refresh token when verified as an access token', async () => {
    const refresh = await service.signRefreshToken('user-1', 'session-1', 'family-1');
    await expect(service.verifyAccessToken(refresh)).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it('rejects a tampered/garbage token', async () => {
    await expect(service.verifyAccessToken('garbage.token.value')).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
