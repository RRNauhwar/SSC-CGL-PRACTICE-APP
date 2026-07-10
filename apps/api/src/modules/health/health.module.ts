import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';

import { PrismaHealthIndicator } from '@/infrastructure/prisma/prisma.health';

/**
 * Wires Terminus with the platform's health indicators. The Prisma and Redis
 * indicators are provided globally by their respective infrastructure modules;
 * additional indicators (OpenSearch, ClickHouse, S3) are registered as those
 * clients are introduced in later steps.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
