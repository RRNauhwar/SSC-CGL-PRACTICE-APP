import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

import type { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Global exception filter that converts every thrown error into the canonical
 * {@link ErrorResponseDto} envelope.
 *
 * Responsibilities:
 * - Map `HttpException`, known Prisma errors, and unknown errors to sensible
 *   HTTP statuses and stable error codes.
 * - Never leak internal details (stack traces, SQL) to clients in production;
 *   full detail is logged server-side with the request id.
 * - Uses the framework-agnostic `HttpAdapterHost` so it also works if the HTTP
 *   platform changes.
 */
/** Lowest HTTP status considered a server-side (5xx) error. */
const SERVER_ERROR_MIN_STATUS = 500;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { id?: string }>();

    const { status, error, message } = this.resolve(exception);

    const body: ErrorResponseDto = {
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: request.id ?? 'unknown',
    };

    // 5xx are unexpected: log at error with full context. 4xx are client
    // errors: log at warn without noise.
    if (status >= SERVER_ERROR_MIN_STATUS) {
      this.logger.error({ err: exception, requestId: body.requestId }, 'Unhandled exception');
    } else {
      this.logger.warn({ requestId: body.requestId, status, error }, 'Request failed');
    }

    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  /** Map an arbitrary thrown value to a status, stable code, and message. */
  private resolve(exception: unknown): {
    status: number;
    error: string;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ?? exception.message);
      return { status, error: this.codeFromStatus(status), message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrisma(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  /** Translate the Prisma error codes we care about into HTTP semantics. */
  private resolvePrisma(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    error: string;
    message: string;
  } {
    switch (exception.code) {
      case 'P2002': // unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          error: 'CONFLICT',
          message: 'A record with the same unique value already exists',
        };
      case 'P2025': // record not found
        return {
          status: HttpStatus.NOT_FOUND,
          error: 'NOT_FOUND',
          message: 'The requested record was not found',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          error: 'DATABASE_ERROR',
          message: 'The request could not be processed',
        };
    }
  }

  private codeFromStatus(status: number): string {
    // Numeric enums expose a reverse mapping (e.g. HttpStatus[400] === 'BAD_REQUEST').
    const key = (HttpStatus as Record<number, string | undefined>)[status];
    return key ?? 'ERROR';
  }
}
