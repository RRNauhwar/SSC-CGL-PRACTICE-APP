import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Params } from 'nestjs-pino';

interface LoggerOptions {
  level: string;
  pretty: boolean;
  isProduction: boolean;
}

/**
 * Builds the `nestjs-pino` configuration used for all structured logging.
 *
 * Design choices:
 * - JSON logs in production (machine-parseable for Grafana/Loki); pretty logs
 *   in development for readability.
 * - Every request gets a correlation id (`x-request-id`), echoed on the
 *   response and attached to each log line so requests are traceable end-to-end.
 * - Sensitive headers/fields are redacted so credentials never reach logs
 *   (doc 15 — Security Architecture).
 */
export function buildLoggerConfig(options: LoggerOptions): Params {
  return {
    pinoHttp: {
      level: options.level,
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const existing = req.headers['x-request-id'];
        const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      // Redact secrets and PII-bearing headers from every log entry.
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["x-api-key"]',
          'res.headers["set-cookie"]',
          '*.password',
          '*.token',
          '*.accessToken',
          '*.refreshToken',
        ],
        censor: '[redacted]',
      },
      autoLogging: {
        // Skip health/metrics probes to keep logs signal-dense.
        ignore: (req: IncomingMessage) =>
          req.url === '/api/v1/health' || req.url === '/api/v1/health/live',
      },
      customProps: (req: IncomingMessage) => ({
        requestId: (req as IncomingMessage & { id?: string }).id,
      }),
      transport: options.pretty
        ? {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
  };
}
