import { SetMetadata } from '@nestjs/common';

/** Metadata key marking a route as publicly accessible (skips JWT auth). */
export const IS_PUBLIC_KEY = 'auth:isPublic';

/**
 * Marks a route (or controller) as public. Because {@link JwtAuthGuard} is
 * registered globally (secure by default), unauthenticated endpoints such as
 * login/register must opt out explicitly with `@Public()`.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
