import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { RequestContext } from '../../domain/token.types';

function header(request: Request, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Extracts contextual request metadata (IP, user-agent, device) for session and
 * device management + audit. Device identity is supplied by the client via the
 * `x-device-id` / `x-device-name` headers.
 */
export const ReqContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return {
      ipAddress: request.ip,
      userAgent: header(request, 'user-agent'),
      deviceId: header(request, 'x-device-id'),
      deviceName: header(request, 'x-device-name'),
    };
  },
);
