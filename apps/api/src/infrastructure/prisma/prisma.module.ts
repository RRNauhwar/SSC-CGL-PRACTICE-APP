import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Provides the single, shared {@link PrismaService} across the application.
 * Marked `@Global` so every feature module can inject it without re-importing.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
