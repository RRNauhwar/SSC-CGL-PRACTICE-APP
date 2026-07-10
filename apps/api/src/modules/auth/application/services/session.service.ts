import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { SessionRevokeReason } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import { InvalidTokenError } from '../../domain/auth.errors';
import type { RequestContext, TokenPair } from '../../domain/token.types';
import {
  SessionRepository,
  type SessionWithDevice,
} from '../../infrastructure/repositories/session.repository';
import type { SessionView } from '../dto/session.dto';

import { TokenService } from './token.service';

/** Outcome of validating + rotating a presented refresh token. */
interface RotationResult {
  userId: string;
  /** Rotation family to carry forward so lineage (and reuse detection) is preserved. */
  familyId: string;
}

/**
 * Owns the refresh-token session lifecycle: issuing token pairs, rotating them
 * securely, detecting refresh-token reuse, and revoking sessions.
 *
 * Rotation & reuse detection (doc 15):
 * - Each login opens a session in a new rotation *family*.
 * - Refreshing revokes the presented session (reason ROTATED) and opens a new
 *   one in the same family.
 * - Presenting an already-revoked (rotated) token is treated as theft: the
 *   entire family is revoked and the caller must re-authenticate.
 * - Only the SHA-256 hash of each refresh token is ever stored.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SessionService.name);
  }

  /**
   * Issue a new access/refresh token pair and persist the session.
   * @param familyId when provided (during rotation), keeps the lineage intact.
   */
  async issueTokens(
    userId: string,
    roles: string[],
    context: RequestContext,
    familyId?: string,
  ): Promise<TokenPair> {
    const sessionId = randomUUID();
    const family = familyId ?? randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.signAccessToken(userId, sessionId, roles),
      this.tokens.signRefreshToken(userId, sessionId, family),
    ]);

    const deviceId = context.deviceId
      ? await this.sessions.upsertDevice(userId, context.deviceId, context.deviceName)
      : undefined;

    await this.sessions.create({
      id: sessionId,
      userId,
      familyId: family,
      refreshTokenHash: this.hashToken(refreshToken),
      deviceId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt: new Date(Date.now() + this.tokens.refreshTtlSeconds * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokens.accessTtlSeconds,
      tokenType: 'Bearer',
    };
  }

  /**
   * Validate a presented refresh token and rotate it (revoking the old session).
   * The caller re-issues tokens with freshly-loaded roles via {@link issueTokens}.
   */
  async validateAndRotate(refreshToken: string): Promise<RotationResult> {
    const claims = await this.tokens.verifyRefreshToken(refreshToken);
    const session = await this.sessions.findByRefreshTokenHash(this.hashToken(refreshToken));

    if (!session || session.id !== claims.sid) {
      throw new InvalidTokenError();
    }

    if (session.revokedAt) {
      // A rotated/revoked token was replayed — assume compromise, kill the family.
      await this.sessions.revokeFamily(session.familyId, SessionRevokeReason.REUSE_DETECTED);
      this.logger.warn(
        { userId: session.userId, familyId: session.familyId },
        'Refresh token reuse detected — family revoked',
      );
      throw new InvalidTokenError('Session is no longer valid, please sign in again');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.revoke(session.id, SessionRevokeReason.EXPIRED);
      throw new InvalidTokenError('Session has expired, please sign in again');
    }

    await this.sessions.revoke(session.id, SessionRevokeReason.ROTATED);
    return { userId: session.userId, familyId: session.familyId };
  }

  /** Revoke a single session (used for logout of the current device). */
  async revokeSession(sessionId: string, reason: SessionRevokeReason): Promise<void> {
    await this.sessions.revoke(sessionId, reason);
  }

  /** Revoke all of a user's sessions, optionally keeping the current one. */
  async revokeAll(userId: string, exceptSessionId?: string): Promise<number> {
    return this.sessions.revokeAllForUser(userId, SessionRevokeReason.LOGOUT, exceptSessionId);
  }

  /** List a user's active sessions, flagging which one is the caller's. */
  async listSessions(userId: string, currentSessionId: string): Promise<SessionView[]> {
    const sessions = await this.sessions.listActiveForUser(userId);
    return sessions.map((session) => this.toView(session, currentSessionId));
  }

  /**
   * Revoke a specific session on behalf of its owner, verifying ownership first.
   * @returns false if the session does not exist or belongs to another user.
   */
  async revokeOwnedSession(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.sessions.findById(sessionId);
    if (!session || session.userId !== userId) {
      return false;
    }
    await this.sessions.revoke(sessionId, SessionRevokeReason.LOGOUT);
    return true;
  }

  private toView(session: SessionWithDevice, currentSessionId: string): SessionView {
    return {
      id: session.id,
      current: session.id === currentSessionId,
      deviceName: session.device?.name ?? null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
