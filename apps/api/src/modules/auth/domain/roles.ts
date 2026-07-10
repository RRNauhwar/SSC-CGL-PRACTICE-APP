/**
 * Canonical RBAC role keys (doc 15 — Security Architecture).
 *
 * These stable, machine-readable keys are the single source of truth used by
 * the role seed, the {@link RolesGuard}, and `@Roles()` decorators — keeping
 * role naming consistent across the whole codebase.
 */
export const Role = {
  LEARNER: 'learner',
  PREMIUM_LEARNER: 'premium_learner',
  CONTENT_EDITOR: 'content_editor',
  REVIEWER: 'reviewer',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
  FINANCE: 'finance',
  ANALYST: 'analyst',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  INSTITUTION_ADMIN: 'institution_admin',
  COACHING_PARTNER: 'coaching_partner',
} as const;

export type RoleKey = (typeof Role)[keyof typeof Role];

/** Human-readable descriptions used when seeding the roles table. */
export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  [Role.LEARNER]: 'Standard aspirant with access to the free tier.',
  [Role.PREMIUM_LEARNER]: 'Aspirant with an active premium subscription.',
  [Role.CONTENT_EDITOR]: 'Creates and edits questions and learning content.',
  [Role.REVIEWER]: 'Reviews and approves ingested questions.',
  [Role.MODERATOR]: 'Moderates community content and handles reports.',
  [Role.SUPPORT]: 'Handles user support and account actions.',
  [Role.FINANCE]: 'Manages subscriptions, payments, and refunds.',
  [Role.ANALYST]: 'Read-only access to platform analytics.',
  [Role.ADMIN]: 'Administrative access to platform operations.',
  [Role.SUPER_ADMIN]: 'Full, unrestricted administrative access.',
  [Role.INSTITUTION_ADMIN]: 'Administers an institution/coaching tenant.',
  [Role.COACHING_PARTNER]: 'Coaching partner with cohort management access.',
};

/** All role keys, useful for seeding and validation. */
export const ALL_ROLES: RoleKey[] = Object.values(Role);
