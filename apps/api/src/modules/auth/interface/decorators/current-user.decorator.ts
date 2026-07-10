import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../domain/token.types';

/**
 * Injects the authenticated principal (set by {@link JwtAuthGuard}) into a
 * handler parameter. Only valid on routes protected by the JWT guard.
 *
 * @example `me(@CurrentUser() user: AuthenticatedUser) { ... }`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user) {
      // Indicates a route used @CurrentUser without being behind the guard.
      throw new Error('CurrentUser used on a route without an authenticated user');
    }
    return request.user;
  },
);
