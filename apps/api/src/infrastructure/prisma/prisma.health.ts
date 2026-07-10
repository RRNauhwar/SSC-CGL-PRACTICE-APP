import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';

import { PrismaService } from './prisma.service';

/**
 * Terminus health indicator backed by {@link PrismaService}.
 * Reports the database as `up`/`down` for the readiness endpoint so orchestration
 * (Kubernetes/ECS) can gate traffic on real dependency health (doc 12).
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const healthy = await this.prisma.isHealthy();
    const result = this.getStatus(key, healthy);

    if (healthy) {
      return result;
    }
    throw new HealthCheckError('Prisma health check failed', result);
  }
}
