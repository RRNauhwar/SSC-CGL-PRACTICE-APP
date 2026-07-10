import { Injectable } from '@nestjs/common';
import { Prisma, type Session, type SessionRevokeReason } from '@prisma/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

/** A session row with its device eagerly loaded (for listing screens). */
export type SessionWithDevice = Prisma.SessionGetPayload<{ include: { device: true } }>;

interface CreateSessionInput {
  /** Explicit id so it can be embedded in the refresh token before persisting. */
  id: string;
  userId: string;
  familyId: string;
  refreshTokenHash: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

/**
 * Persistence for auth sessions and devices. All refresh-token session state
 * (creation, rotation, revocation, listing) flows through here.
 */
@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateSessionInput): Promise<Session> {
    return this.prisma.session.create({
      data: {
        id: input.id,
        userId: input.userId,
        familyId: input.familyId,
        refreshTokenHash: input.refreshTokenHash,
        deviceId: input.deviceId,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        expiresAt: input.expiresAt,
      },
    });
  }

  findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  findByRefreshTokenHash(hash: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { refreshTokenHash: hash } });
  }

  /** Active = not revoked and not past expiry. Ordered most-recently-used first. */
  listActiveForUser(userId: string): Promise<SessionWithDevice[]> {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { device: true },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async revoke(id: string, reason: SessionRevokeReason): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  /** Revoke every still-active session sharing a rotation family (reuse defense). */
  async revokeFamily(familyId: string, reason: SessionRevokeReason): Promise<void> {
    await this.prisma.session.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  /** Revoke all active sessions for a user, optionally keeping one (current). */
  async revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    exceptSessionId?: string,
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
    return result.count;
  }

  async touch(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  /** Find-or-create a device by its client fingerprint, refreshing lastSeenAt. */
  async upsertDevice(userId: string, fingerprint: string, name?: string): Promise<string> {
    const device = await this.prisma.device.upsert({
      where: { userId_fingerprint: { userId, fingerprint } },
      create: { userId, fingerprint, name },
      update: { lastSeenAt: new Date(), ...(name ? { name } : {}) },
    });
    return device.id;
  }
}
