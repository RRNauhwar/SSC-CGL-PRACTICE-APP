import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { RoleKey } from '../../domain/roles';
import type { AuthenticatedUser } from '../../domain/token.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Authorization guard enforcing `@Roles()` requirements. Registered globally
 * and runs after {@link JwtAuthGuard}, so `request.user` is populated. Routes
 * without a `@Roles()` requirement are allowed for any authenticated principal.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleKey[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const roles = request.user?.roles ?? [];

    if (!roles.some((role) => required.includes(role as RoleKey))) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}
