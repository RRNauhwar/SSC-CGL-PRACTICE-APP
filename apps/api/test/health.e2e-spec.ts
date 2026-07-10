import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';
import { configureApp } from '@/bootstrap/configure-app';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

/**
 * End-to-end coverage for the health endpoints.
 *
 * The Prisma dependency is stubbed so this suite runs without a live database
 * (fast, hermetic). A separate integration suite (Testcontainers) will exercise
 * the real database in a later step.
 */
describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        // Health indicator only needs isHealthy(); lifecycle hooks are no-ops.
        isHealthy: () => Promise.resolve(true),
        $connect: () => Promise.resolve(),
        $disconnect: () => Promise.resolve(),
        onModuleInit: () => Promise.resolve(),
        onModuleDestroy: () => Promise.resolve(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    // Apply the exact same runtime configuration as production.
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health/live returns ok', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);

    expect(response.body).toMatchObject({ status: 'ok' });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('GET /api/v1/health returns a healthy readiness result', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.info).toHaveProperty('database');
    expect(response.body.info.database.status).toBe('up');
  });
});
