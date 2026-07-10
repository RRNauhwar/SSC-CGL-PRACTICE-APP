import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';

import { PrismaHealthIndicator } from '@/infrastructure/prisma/prisma.health';

/**
 * Wires Terminus with the platform's health indicators. Additional indicators
 * (Redis, OpenSearch, ClickHouse, S3) will be registered here as those clients
 * are introduced in later steps.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
