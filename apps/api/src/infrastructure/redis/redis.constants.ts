/**
 * Injection token for the raw ioredis client.
 *
 * A symbol-like string token lets us provide/inject the client via Nest DI
 * without leaking the concrete `ioredis` type into consumers that only need the
 * higher-level {@link RedisService}.
 */
export const REDIS_CLIENT = 'REDIS_CLIENT';
