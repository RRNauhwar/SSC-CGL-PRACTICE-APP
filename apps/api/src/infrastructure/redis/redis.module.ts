import { Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

import { REDIS_CLIENT } from './redis.constants';
import { RedisHealthIndicator } from './redis.health';
import { RedisService } from './redis.service';

import { AppConfigService } from '@/config/app-config.service';

/**
 * Provides a single, shared ioredis connection plus the {@link RedisService}
 * wrapper across the application (marked `@Global`).
 *
 * The client is created via a factory from validated config, with a bounded
 * retry strategy so a briefly-unavailable Redis does not crash the process. The
 * connection is closed cleanly on application shutdown.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService, PinoLogger],
      useFactory: (config: AppConfigService, logger: PinoLogger): Redis => {
        logger.setContext('RedisModule');
        const client = new Redis(config.datastores.redisUrl, {
          // Fail fast on individual commands rather than queueing forever.
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          // Exponential-ish backoff capped at 2s between reconnection attempts.
          retryStrategy: (times) => Math.min(times * 200, 2000),
        });

        client.on('error', (err) => logger.error({ err }, 'Redis client error'));
        client.on('connect', () => logger.info('Redis connected'));

        return client;
      },
    },
    RedisService,
    RedisHealthIndicator,
  ],
  exports: [RedisService, RedisHealthIndicator],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly redis: RedisService) {}

  async onApplicationShutdown(): Promise<void> {
    // Gracefully close the connection so Redis sees a clean QUIT.
    await this.redis.raw.quit();
  }
}
