import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { buildLoggerConfig } from './common/logging/logger.config';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

/**
 * Composition root of the API.
 *
 * Wires cross-cutting infrastructure (config, logging, database, error
 * handling) and mounts feature modules. Feature modules added in later steps
 * (auth, content/PYQ, assessment, analytics, ...) are registered here, each in
 * its own Clean-Architecture bounded context under `src/modules/<feature>`.
 */
@Module({
  imports: [
    AppConfigModule,
    // Structured logging configured from validated env (async so it can read config).
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        buildLoggerConfig({
          level: config.logging.level,
          pretty: config.logging.pretty,
          isProduction: config.isProduction,
        }),
    }),
    PrismaModule,
    HealthModule,
  ],
  providers: [
    // Register the canonical error envelope filter application-wide.
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
