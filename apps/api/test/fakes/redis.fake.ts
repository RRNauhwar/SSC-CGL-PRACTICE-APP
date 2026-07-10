import type Redis from 'ioredis';

/**
 * In-memory stand-in for the subset of the ioredis API used by `RedisService`.
 *
 * Lets e2e tests exercise OTP/rate-limit logic and health checks without a live
 * Redis. Supports value expiry so TTL-dependent behaviour (OTP expiry, rate
 * windows) is faithfully reproduced. Cast to `Redis` at the injection boundary.
 */
export class FakeRedis {
  private readonly store = new Map<string, { value: string; expireAt?: number }>();

  private isExpired(entry: { expireAt?: number }): boolean {
    return entry.expireAt !== undefined && entry.expireAt <= Date.now();
  }

  private read(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.read(key));
  }

  set(key: string, value: string, mode?: string, ttlSeconds?: number): Promise<'OK'> {
    const expireAt =
      mode === 'EX' && ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expireAt });
    return Promise.resolve('OK');
  }

  del(...keys: string[]): Promise<number> {
    let removed = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        removed += 1;
      }
    }
    return Promise.resolve(removed);
  }

  incr(key: string): Promise<number> {
    const current = Number(this.read(key) ?? '0') + 1;
    const existing = this.store.get(key);
    this.store.set(key, { value: String(current), expireAt: existing?.expireAt });
    return Promise.resolve(current);
  }

  expire(key: string, ttlSeconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) {
      return Promise.resolve(0);
    }
    entry.expireAt = Date.now() + ttlSeconds * 1000;
    return Promise.resolve(1);
  }

  ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) {
      return Promise.resolve(-2);
    }
    if (entry.expireAt === undefined) {
      return Promise.resolve(-1);
    }
    return Promise.resolve(Math.max(0, Math.ceil((entry.expireAt - Date.now()) / 1000)));
  }

  ping(): Promise<'PONG'> {
    return Promise.resolve('PONG');
  }

  quit(): Promise<'OK'> {
    return Promise.resolve('OK');
  }

  // ioredis emits lifecycle events; tests don't need them.
  on(): this {
    return this;
  }

  /** Reset state between tests. */
  flushall(): Promise<'OK'> {
    this.store.clear();
    return Promise.resolve('OK');
  }

  asRedis(): Redis {
    return this as unknown as Redis;
  }
}
