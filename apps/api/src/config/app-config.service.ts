import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * Type-safe accessor over the validated environment.
 *
 * Wrapping Nest's generic {@link ConfigService} gives the rest of the codebase
 * a single, strongly-typed API for configuration and keeps `process.env` access
 * out of business logic (dependency inversion — config is injected, not read
 * globally). Grouped getters make call sites read intentfully.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  /** Read a single validated env value with full type inference. */
  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  get http() {
    return {
      port: this.get('API_PORT'),
      baseUrl: this.get('API_BASE_URL'),
      corsOrigins: this.get('CORS_ORIGINS'),
      globalPrefix: this.get('API_GLOBAL_PREFIX'),
      version: this.get('API_VERSION'),
    };
  }

  get logging() {
    return {
      level: this.get('LOG_LEVEL'),
      pretty: this.get('LOG_PRETTY'),
    };
  }

  get telemetry() {
    return {
      enabled: this.get('OTEL_ENABLED'),
      serviceName: this.get('OTEL_SERVICE_NAME'),
      endpoint: this.get('OTEL_EXPORTER_OTLP_ENDPOINT') || undefined,
    };
  }

  get datastores() {
    return {
      databaseUrl: this.get('DATABASE_URL'),
      redisUrl: this.get('REDIS_URL'),
      opensearchNode: this.get('OPENSEARCH_NODE'),
      clickhouseUrl: this.get('CLICKHOUSE_URL'),
    };
  }

  get objectStorage() {
    return {
      endpoint: this.get('S3_ENDPOINT'),
      region: this.get('S3_REGION'),
      accessKeyId: this.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.get('S3_SECRET_ACCESS_KEY'),
      bucket: this.get('S3_BUCKET'),
      forcePathStyle: this.get('S3_FORCE_PATH_STYLE'),
    };
  }

  get auth() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      accessTtlSeconds: this.get('JWT_ACCESS_TTL'),
      refreshTtlSeconds: this.get('JWT_REFRESH_TTL'),
    };
  }
}
