import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';

import { APP_VERSION } from './app.constants';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap/configure-app';
import { AppConfigService } from './config/app-config.service';
import { startTracing, stopTracing } from './observability/tracing';

// Teach @nestjs/swagger how to render Zod DTOs (created via `createZodDto`) so
// request/response schemas appear in the OpenAPI document. Called once at load.
patchNestJsSwagger();

/**
 * Application entrypoint.
 *
 * Order matters:
 * 1. Start tracing FIRST, before any instrumented module is used, so
 *    OpenTelemetry auto-instrumentation can patch http/express/pg.
 * 2. Create the app with buffered logs, then swap in the structured pino logger.
 * 3. Apply shared configuration (security, CORS, versioning, validation).
 * 4. Mount Swagger and register graceful shutdown.
 */
async function bootstrap(): Promise<void> {
  startTracing({
    enabled: process.env.OTEL_ENABLED === 'true',
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'ssc-api',
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || undefined,
    serviceVersion: APP_VERSION,
  });

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Route all framework logs through the structured pino logger.
  app.useLogger(app.get(PinoLogger));

  const config = app.get(AppConfigService);
  const { port, baseUrl, globalPrefix, version } = config.http;

  // Shared security/validation/versioning setup (also used by e2e tests).
  configureApp(app);

  // --- OpenAPI / Swagger (doc 12 — API-first) ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SSC Prep Platform API')
    .setDescription('REST API for the SSC CGL/CHSL preparation platform.')
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // --- Graceful shutdown ---
  const shutdown = async (): Promise<void> => {
    await app.close();
    await stopTracing();
  };
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());

  await app.listen(port);

  const logger = app.get(PinoLogger);
  logger.log(`API listening on ${baseUrl} (prefix: /${globalPrefix}/${version})`);
  logger.log(`Swagger docs available at /${globalPrefix}/docs`);
}

void bootstrap();
