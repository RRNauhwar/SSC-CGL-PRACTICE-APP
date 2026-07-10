import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigService } from './app-config.service';
import { validateEnv } from './env.schema';

/**
 * Global configuration module.
 *
 * - Loads `.env` (Nest's ConfigModule) and validates the whole environment via
 *   the Zod schema at boot (`validateEnv`), so the process refuses to start with
 *   invalid config.
 * - Exposes {@link AppConfigService} everywhere (marked `@Global`) so feature
 *   modules never need to re-import it.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Zod owns validation; return the parsed, coerced object back to Nest.
      validate: (raw) => validateEnv(raw),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
