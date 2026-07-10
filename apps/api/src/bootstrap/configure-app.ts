import { VersioningType, type INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppConfigService } from '@/config/app-config.service';

/**
 * Applies all shared runtime configuration to a Nest application instance:
 * security headers, CORS, global route prefix + URI versioning, and global
 * Zod-based input validation.
 *
 * Extracted into a single function so the production bootstrap (`main.ts`) and
 * e2e tests configure the app identically — eliminating prod/test drift.
 *
 * Note: the global exception filter is registered via `APP_FILTER` in
 * {@link AppModule} (so it receives its dependencies through DI) and therefore
 * is intentionally not applied here.
 *
 * @param app A created (not yet listening) Nest application.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(AppConfigService);
  const { corsOrigins, globalPrefix, version } = config.http;

  // Security headers (secure defaults — doc 15).
  app.use(helmet());

  // Strict, explicit CORS allow-list.
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Routing: global prefix + URI versioning => /api/v1/...
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: version.replace(/^v/, ''),
    prefix: 'v',
  });

  // Global validation using Zod schemas (the platform-wide validation library).
  app.useGlobalPipes(new ZodValidationPipe());

  // Flush connections/traces on SIGTERM/SIGINT.
  app.enableShutdownHooks();
}
