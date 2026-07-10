import { validateEnv } from './env.schema';

/**
 * Minimal set of env vars that satisfy the schema's required fields.
 * Individual tests override this to assert specific validation behaviour.
 */
const baseEnv: NodeJS.ProcessEnv = {
  DATABASE_URL: 'postgresql://ssc:pw@localhost:5432/ssc_prep?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  OPENSEARCH_NODE: 'http://localhost:9200',
  CLICKHOUSE_URL: 'http://localhost:8123',
  S3_ENDPOINT: 'http://localhost:9002',
  S3_ACCESS_KEY_ID: 'ssc',
  S3_SECRET_ACCESS_KEY: 'ssc_local_password',
  S3_BUCKET: 'ssc-media',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('validateEnv', () => {
  it('parses a valid environment and applies defaults', () => {
    const env = validateEnv(baseEnv);

    expect(env.NODE_ENV).toBe('development');
    expect(env.API_PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000']);
    expect(env.OTEL_ENABLED).toBe(false);
  });

  it('coerces numeric and boolean strings', () => {
    const env = validateEnv({ ...baseEnv, API_PORT: '8080', LOG_PRETTY: 'true' });

    expect(env.API_PORT).toBe(8080);
    expect(env.LOG_PRETTY).toBe(true);
  });

  it('splits CORS_ORIGINS into a trimmed array', () => {
    const env = validateEnv({
      ...baseEnv,
      CORS_ORIGINS: 'http://a.com, http://b.com ,http://c.com',
    });

    expect(env.CORS_ORIGINS).toEqual(['http://a.com', 'http://b.com', 'http://c.com']);
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_URL: _omitted, ...withoutDb } = baseEnv;

    expect(() => validateEnv(withoutDb)).toThrow(/DATABASE_URL/);
  });

  it('rejects identical JWT secrets', () => {
    expect(() =>
      validateEnv({ ...baseEnv, JWT_REFRESH_SECRET: baseEnv.JWT_ACCESS_SECRET }),
    ).toThrow(/must be different/);
  });

  it('requires an OTLP endpoint when tracing is enabled', () => {
    expect(() => validateEnv({ ...baseEnv, OTEL_ENABLED: 'true' })).toThrow(
      /OTEL_EXPORTER_OTLP_ENDPOINT/,
    );
  });
});
