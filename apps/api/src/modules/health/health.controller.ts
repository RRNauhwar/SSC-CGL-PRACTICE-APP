import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, type HealthCheckResult } from '@nestjs/terminus';

import { PrismaHealthIndicator } from '@/infrastructure/prisma/prisma.health';

/**
 * Health endpoints consumed by load balancers and container orchestrators.
 *
 * - `GET /health/live`  — liveness: is the process running? (no dependencies)
 * - `GET /health`       — readiness: are critical dependencies reachable?
 *
 * Splitting liveness from readiness prevents a transient DB blip from causing
 * the orchestrator to kill an otherwise-healthy process (doc 12).
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — process is up.' })
  live(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe — critical dependencies are reachable.' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.prisma.isHealthy('database')]);
  }
}
