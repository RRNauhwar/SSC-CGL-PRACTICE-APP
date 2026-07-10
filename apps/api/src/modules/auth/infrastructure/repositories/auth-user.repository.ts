import { Injectable } from '@nestjs/common';
import { AuthProvider, Prisma, UserStatus } from '@prisma/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

/** Include shape that always loads a user's roles and credentials. */
const authInclude = {
  roles: { include: { role: true } },
  credentials: true,
} satisfies Prisma.UserInclude;

/** A user row with roles + credentials eagerly loaded. */
export type AuthUserRecord = Prisma.UserGetPayload<{ include: typeof authInclude }>;

/** Extract the flat list of role names from a loaded user. */
export function roleNamesOf(user: { roles: { role: { name: string } }[] }): string[] {
  return user.roles.map((assignment) => assignment.role.name);
}

/** Get the password hash for a user (if they have a PASSWORD credential). */
export function passwordHashOf(user: AuthUserRecord): string | null {
  return user.credentials.find((c) => c.provider === AuthProvider.PASSWORD)?.passwordHash ?? null;
}

interface CreateUserInput {
  email: string;
  name?: string;
  /** Role key that must already exist (seeded), e.g. "learner". */
  roleName: string;
  credential:
    | { provider: typeof AuthProvider.PASSWORD; passwordHash: string }
    | { provider: typeof AuthProvider.GOOGLE; providerUid: string }
    | { provider: typeof AuthProvider.EMAIL_OTP };
}

/**
 * Persistence for the identity aggregate (users + credentials + role links)
 * within the auth module. Encapsulates all Prisma access so services depend on
 * an intention-revealing API rather than the ORM directly.
 */
@Injectable()
export class AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({ where: { id }, include: authInclude });
  }

  findByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: authInclude,
    });
  }

  async findByProvider(
    provider: AuthProvider,
    providerUid: string,
  ): Promise<AuthUserRecord | null> {
    const credential = await this.prisma.authCredential.findUnique({
      where: { provider_providerUid: { provider, providerUid } },
      include: { user: { include: authInclude } },
    });
    return credential?.user ?? null;
  }

  /**
   * Create a new active user with a single credential, default preferences, and
   * one role — atomically. The role must already be seeded.
   */
  async createUser(input: CreateUserInput): Promise<AuthUserRecord> {
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({ where: { name: input.roleName } });
      if (!role) {
        throw new Error(
          `Role "${input.roleName}" is not seeded. Run the role seed before creating users.`,
        );
      }

      return tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          status: UserStatus.ACTIVE,
          preferences: { create: {} },
          roles: { create: [{ role: { connect: { id: role.id } } }] },
          credentials: { create: [this.buildCredentialData(input.credential)] },
        },
        include: authInclude,
      });
    });
  }

  /** Attach an additional credential (e.g. link Google) to an existing user. */
  async addCredential(userId: string, credential: CreateUserInput['credential']): Promise<void> {
    await this.prisma.authCredential.create({
      data: { userId, ...this.buildCredentialData(credential) },
    });
  }

  private buildCredentialData(
    credential: CreateUserInput['credential'],
  ): Prisma.AuthCredentialCreateWithoutUserInput {
    switch (credential.provider) {
      case AuthProvider.PASSWORD:
        return { provider: AuthProvider.PASSWORD, passwordHash: credential.passwordHash };
      case AuthProvider.GOOGLE:
        return { provider: AuthProvider.GOOGLE, providerUid: credential.providerUid };
      case AuthProvider.EMAIL_OTP:
        return { provider: AuthProvider.EMAIL_OTP };
    }
  }
}
