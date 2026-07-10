import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

/**
 * Thin, intention-revealing wrapper over the ioredis client.
 *
 * Consumers depend on this service (dependency inversion) rather than importing
 * `ioredis` directly, which keeps Redis usage discoverable and makes the client
 * trivial to fake in unit tests. Only the operations the platform actually
 * needs are exposed; add methods here as new use cases arise.
 */
@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /** Access the underlying client for advanced/atomic operations. */
  get raw(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a key with an optional TTL (seconds).
   * @param ttlSeconds when provided, the key expires after this many seconds.
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds !== undefined) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.client.del(...keys);
  }

  /**
   * Atomically increment a counter and ensure it carries a TTL. Used for
   * rate-limit windows (OTP requests, login attempts). The expiry is only set
   * on the first increment so the window does not slide.
   */
  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return count;
  }

  /** Remaining time-to-live for a key, in seconds (-2 if missing, -1 if no TTL). */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /** Liveness probe used by the health indicator. */
  async ping(): Promise<boolean> {
    const reply = await this.client.ping();
    return reply === 'PONG';
  }
}
