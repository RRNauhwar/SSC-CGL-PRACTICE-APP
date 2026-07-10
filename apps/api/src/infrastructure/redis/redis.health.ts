import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';

import { RedisService } from './redis.service';

/**
 * Terminus health indicator for Redis, reported by the readiness probe so
 * orchestration can gate traffic on cache/queue availability (doc 12).
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    let healthy = false;
    try {
      healthy = await this.redis.ping();
    } catch {
      healthy = false;
    }

    const result = this.getStatus(key, healthy);
    if (healthy) {
      return result;
    }
    throw new HealthCheckError('Redis health check failed', result);
  }
}
