import { randomUUID } from 'node:crypto';

import { type AuthProvider, UserStatus, type SessionRevokeReason } from '@prisma/client';

import { Role } from '@/modules/auth/domain/roles';

/**
 * In-memory fakes for the auth repositories, used by the auth e2e suite so the
 * full HTTP → guard → service → repository stack can be exercised without a live
 * database. They reproduce the observable behaviour the services rely on
 * (unique email, credential lookup, session rotation/reuse bookkeeping).
 */

interface StoredUser {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  handle: string | null;
  locale: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  roles: { role: { id: string; name: string; description: string | null; createdAt: Date } }[];
  credentials: {
    provider: AuthProvider;
    providerUid: string | null;
    passwordHash: string | null;
  }[];
}

interface StoredSession {
  id: string;
  userId: string;
  familyId: string;
  refreshTokenHash: string;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: SessionRevokeReason | null;
  createdAt: Date;
  lastUsedAt: Date;
  device: { name: string | null } | null;
}

type CredentialInput =
  | { provider: typeof AuthProvider.PASSWORD; passwordHash: string }
  | { provider: typeof AuthProvider.GOOGLE; providerUid: string }
  | { provider: typeof AuthProvider.EMAIL_OTP };

export class FakeAuthUserRepository {
  private readonly users = new Map<string, StoredUser>();

  findById(id: string): Promise<StoredUser | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: string): Promise<StoredUser | null> {
    const found = [...this.users.values()].find((u) => u.email === email.toLowerCase());
    return Promise.resolve(found ?? null);
  }

  findByProvider(provider: AuthProvider, providerUid: string): Promise<StoredUser | null> {
    const found = [...this.users.values()].find((u) =>
      u.credentials.some((c) => c.provider === provider && c.providerUid === providerUid),
    );
    return Promise.resolve(found ?? null);
  }

  createUser(input: {
    email: string;
    name?: string;
    roleName: string;
    credential: CredentialInput;
  }): Promise<StoredUser> {
    const now = new Date();
    const user: StoredUser = {
      id: randomUUID(),
      phone: null,
      email: input.email.toLowerCase(),
      name: input.name ?? null,
      handle: null,
      locale: 'en',
      status: UserStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      roles: [
        {
          role: {
            id: randomUUID(),
            name: input.roleName || Role.LEARNER,
            description: null,
            createdAt: now,
          },
        },
      ],
      credentials: [this.toCredential(input.credential)],
    };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  addCredential(userId: string, credential: CredentialInput): Promise<void> {
    this.users.get(userId)?.credentials.push(this.toCredential(credential));
    return Promise.resolve();
  }

  private toCredential(credential: CredentialInput): StoredUser['credentials'][number] {
    return {
      provider: credential.provider,
      providerUid: 'providerUid' in credential ? credential.providerUid : null,
      passwordHash: 'passwordHash' in credential ? credential.passwordHash : null,
    };
  }
}

export class FakeSessionRepository {
  private readonly sessions = new Map<string, StoredSession>();

  create(input: {
    id: string;
    userId: string;
    familyId: string;
    refreshTokenHash: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<StoredSession> {
    const now = new Date();
    const session: StoredSession = {
      id: input.id,
      userId: input.userId,
      familyId: input.familyId,
      refreshTokenHash: input.refreshTokenHash,
      deviceId: input.deviceId ?? null,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
      expiresAt: input.expiresAt,
      revokedAt: null,
      revokedReason: null,
      createdAt: now,
      lastUsedAt: now,
      device: null,
    };
    this.sessions.set(session.id, session);
    return Promise.resolve(session);
  }

  findById(id: string): Promise<StoredSession | null> {
    return Promise.resolve(this.sessions.get(id) ?? null);
  }

  findByRefreshTokenHash(hash: string): Promise<StoredSession | null> {
    const found = [...this.sessions.values()].find((s) => s.refreshTokenHash === hash);
    return Promise.resolve(found ?? null);
  }

  listActiveForUser(userId: string): Promise<StoredSession[]> {
    const now = Date.now();
    const active = [...this.sessions.values()].filter(
      (s) => s.userId === userId && !s.revokedAt && s.expiresAt.getTime() > now,
    );
    return Promise.resolve(active);
  }

  revoke(id: string, reason: SessionRevokeReason): Promise<void> {
    const session = this.sessions.get(id);
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      session.revokedReason = reason;
    }
    return Promise.resolve();
  }

  revokeFamily(familyId: string, reason: SessionRevokeReason): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = new Date();
        session.revokedReason = reason;
      }
    }
    return Promise.resolve();
  }

  revokeAllForUser(
    userId: string,
    reason: SessionRevokeReason,
    exceptSessionId?: string,
  ): Promise<number> {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt && session.id !== exceptSessionId) {
        session.revokedAt = new Date();
        session.revokedReason = reason;
        count += 1;
      }
    }
    return Promise.resolve(count);
  }

  touch(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.lastUsedAt = new Date();
    }
    return Promise.resolve();
  }

  upsertDevice(_userId: string, fingerprint: string): Promise<string> {
    return Promise.resolve(`device-${fingerprint}`);
  }
}
