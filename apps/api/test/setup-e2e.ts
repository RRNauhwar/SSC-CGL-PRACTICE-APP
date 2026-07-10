/**
 * E2E test bootstrap.
 *
 * Runs (via Jest `setupFiles`) BEFORE any application module is imported, so the
 * environment passes the Zod validation performed by `AppConfigModule` at import
 * time. Datastore URLs point at unreachable localhost values on purpose — e2e
 * suites stub external adapters (e.g. Prisma) rather than hitting real services.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.OPENSEARCH_NODE = 'http://localhost:9200';
process.env.CLICKHOUSE_URL = 'http://localhost:8123';
process.env.S3_ENDPOINT = 'http://localhost:9002';
process.env.S3_ACCESS_KEY_ID = 'test';
process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
process.env.S3_BUCKET = 'ssc-media-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-test-access-secret-32';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-test-refresh-secret-32';
process.env.LOG_LEVEL = 'error';
