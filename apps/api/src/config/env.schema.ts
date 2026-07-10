import { z } from 'zod';

/**
 * Single source of truth for every environment variable the API consumes.
 *
 * Validating configuration at boot (fail-fast) prevents a whole class of
 * production incidents caused by missing or malformed env vars. The parsed,
 * strongly-typed result is exposed application-wide via {@link AppConfigService}.
 */

const booleanFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

const csvToArray = z.string().transform((value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
);

export const envSchema = z
  .object({
    // --- Runtime ---
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    API_BASE_URL: z.string().url().default('http://localhost:4000'),
    CORS_ORIGINS: csvToArray.default('http://localhost:3000'),
    API_GLOBAL_PREFIX: z.string().default('api'),
    API_VERSION: z.string().default('v1'),

    // --- Logging & Observability ---
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_PRETTY: booleanFromString.default('false'),
    OTEL_ENABLED: booleanFromString.default('false'),
    OTEL_SERVICE_NAME: z.string().default('ssc-api'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal('')),

    // --- Datastores ---
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    OPENSEARCH_NODE: z.string().url(),
    CLICKHOUSE_URL: z.string().url(),

    // --- Object storage ---
    S3_ENDPOINT: z.string().url(),
    S3_REGION: z.string().default('us-east-1'),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    S3_FORCE_PATH_STYLE: booleanFromString.default('true'),

    // --- Auth / Security (consumed by the Auth module in a later step) ---
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_TTL: z.coerce.number().int().positive().default(1209600),
  })
  .superRefine((env, ctx) => {
    // Enforce distinct signing secrets so an access-token leak cannot mint refresh tokens.
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values',
        path: ['JWT_REFRESH_SECRET'],
      });
    }
    // If tracing is enabled, an exporter endpoint is mandatory.
    if (env.OTEL_ENABLED && !env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'OTEL_EXPORTER_OTLP_ENDPOINT is required when OTEL_ENABLED=true',
        path: ['OTEL_EXPORTER_OTLP_ENDPOINT'],
      });
    }
  });

/** Fully validated, strongly-typed environment. */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate `process.env`. Throws a readable, aggregated error listing
 * every invalid/missing variable so misconfiguration is obvious at startup.
 */
export function validateEnv(raw: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return result.data;
}
