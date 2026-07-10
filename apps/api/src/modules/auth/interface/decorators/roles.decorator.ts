import { SetMetadata } from '@nestjs/common';

import type { RoleKey } from '../../domain/roles';

/** Metadata key holding the roles required to access a route. */
export const ROLES_KEY = 'auth:roles';

/**
 * Restricts a route to principals holding at least one of the given roles.
 * Enforced by {@link RolesGuard}. Use with the canonical {@link RoleKey} values.
 *
 * @example
 * ```ts
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * @Get('admin/metrics')
 * metrics() { ... }
 * ```
 */
export const Roles = (...roles: RoleKey[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
