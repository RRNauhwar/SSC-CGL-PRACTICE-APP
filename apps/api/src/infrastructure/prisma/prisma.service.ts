import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

/**
 * Thin wrapper around {@link PrismaClient} integrated with the Nest lifecycle.
 *
 * - Connects on module init and disconnects on destroy so the connection pool
 *   is managed with the application lifecycle (no dangling connections).
 * - Exposes a {@link isHealthy} probe used by the health module (doc 12) to
 *   verify database connectivity.
 *
 * Repositories in feature modules depend on this service (dependency
 * inversion) rather than instantiating their own client.
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: PinoLogger) {
    super({
      // Surface Prisma warnings/errors through the structured logger.
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
    this.logger.setContext(PrismaService.name);
  }

  async onModuleInit(): Promise<void> {
    this.$on('warn', (event) => this.logger.warn(event));
    this.$on('error', (event) => this.logger.error(event));
    await this.$connect();
    this.logger.info('Prisma connected to the database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.info('Prisma disconnected from the database');
  }

  /** Lightweight connectivity check for readiness probes. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
