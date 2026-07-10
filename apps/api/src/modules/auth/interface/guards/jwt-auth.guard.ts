import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { TokenService } from '../../application/services/token.service';
import { InvalidTokenError } from '../../domain/auth.errors';
import type { AuthenticatedUser } from '../../domain/token.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Global authentication guard.
 *
 * Registered as an `APP_GUARD` so every route is protected by default (secure
 * by default). Routes annotated with `@Public()` are skipped. On success the
 * verified principal is attached to `request.user` for `@CurrentUser()` and the
 * {@link RolesGuard}.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new InvalidTokenError('Authentication required');
    }

    const payload = await this.tokens.verifyAccessToken(token);
    request.user = { id: payload.sub, sessionId: payload.sid, roles: payload.roles };
    return true;
  }

  private extractBearerToken(authorization: string | undefined): string | null {
    if (!authorization) {
      return null;
    }
    const [scheme, value] = authorization.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
