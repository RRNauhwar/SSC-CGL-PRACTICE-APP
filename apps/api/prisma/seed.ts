/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

import { ALL_ROLES, ROLE_DESCRIPTIONS } from '../src/modules/auth/domain/roles';

/**
 * Idempotent database seed.
 *
 * Seeds the canonical RBAC roles (doc 15). New users are assigned the `learner`
 * role at registration, so this seed MUST be run before the app serves sign-ups
 * (it is wired into `prisma migrate` via the `prisma.seed` config and can be run
 * directly with `pnpm --filter @ssc/api prisma:seed`).
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  for (const name of ALL_ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: { description: ROLE_DESCRIPTIONS[name] },
      create: { name, description: ROLE_DESCRIPTIONS[name] },
    });
  }
  console.log(`Seeded ${ALL_ROLES.length} RBAC roles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
