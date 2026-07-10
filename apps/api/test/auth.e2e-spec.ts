import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { FakeAuthUserRepository, FakeSessionRepository } from './fakes/auth-repositories.fake';
import { FakeRedis } from './fakes/redis.fake';

import { AppModule } from '@/app.module';
import { configureApp } from '@/bootstrap/configure-app';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { REDIS_CLIENT } from '@/infrastructure/redis/redis.constants';
import { AuthUserRepository } from '@/modules/auth/infrastructure/repositories/auth-user.repository';
import { SessionRepository } from '@/modules/auth/infrastructure/repositories/session.repository';

/**
 * End-to-end coverage of the auth flow through the real HTTP stack (global JWT
 * guard, validation, controllers, services) with in-memory repositories and
 * Redis. Proves wiring, token rotation, reuse detection, and access control.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  const prismaStub = {
    isHealthy: () => Promise.resolve(true),
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    onModuleInit: () => Promise.resolve(),
    onModuleDestroy: () => Promise.resolve(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaStub)
      .overrideProvider(REDIS_CLIENT)
      .useValue(new FakeRedis())
      .overrideProvider(AuthUserRepository)
      .useValue(new FakeAuthUserRepository())
      .overrideProvider(SessionRepository)
      .useValue(new FakeSessionRepository())
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const register = (email: string, password = 'Sup3r-secret!') =>
    http().post('/api/v1/auth/register').send({ email, password });

  it('registers a new user and returns tokens + profile', async () => {
    const res = await register('ankit@example.com').expect(201);

    expect(res.body.user.email).toBe('ankit@example.com');
    expect(res.body.user.roles).toContain('learner');
    expect(res.body.tokens.accessToken).toEqual(expect.any(String));
    expect(res.body.tokens.refreshToken).toEqual(expect.any(String));
    expect(res.body.tokens.tokenType).toBe('Bearer');
  });

  it('rejects duplicate registration', async () => {
    await register('dupe@example.com').expect(201);
    await register('dupe@example.com').expect(409);
  });

  it('rejects invalid registration payloads (Zod validation)', async () => {
    await http()
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);
  });

  it('returns the profile for an authenticated request and 401 without a token', async () => {
    const { body } = await register('priya@example.com').expect(201);

    await http()
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${body.tokens.accessToken}`)
      .expect(200)
      .expect((res) => expect(res.body.email).toBe('priya@example.com'));

    await http().get('/api/v1/auth/me').expect(401);
  });

  it('logs in with correct credentials and rejects wrong passwords', async () => {
    await register('ravi@example.com', 'Right-Password-1').expect(201);

    await http()
      .post('/api/v1/auth/login')
      .send({ email: 'ravi@example.com', password: 'Right-Password-1' })
      .expect(200);

    await http()
      .post('/api/v1/auth/login')
      .send({ email: 'ravi@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('rotates refresh tokens and detects reuse of a rotated token', async () => {
    const { body } = await register('sneha@example.com').expect(201);
    const originalRefresh = body.tokens.refreshToken;

    // First refresh succeeds and returns a new pair.
    const refreshed = await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: originalRefresh })
      .expect(200);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));

    // Replaying the now-rotated original token is detected and rejected.
    await http().post('/api/v1/auth/refresh').send({ refreshToken: originalRefresh }).expect(401);

    // Reuse revokes the whole family, so the newly-issued token is dead too.
    await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshed.body.refreshToken })
      .expect(401);
  });

  it('revokes the session on logout so its refresh token stops working', async () => {
    const { body } = await register('logout@example.com').expect(201);

    await http()
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${body.tokens.accessToken}`)
      .expect(200);

    await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: body.tokens.refreshToken })
      .expect(401);
  });
});
