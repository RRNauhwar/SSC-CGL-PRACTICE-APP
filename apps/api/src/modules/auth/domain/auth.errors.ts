import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Auth-specific exceptions with stable, machine-readable codes.
 *
 * They extend Nest's HTTP exceptions so the global exception filter renders the
 * canonical error envelope automatically. Messages are deliberately generic for
 * credential-related failures to avoid user/account enumeration (doc 15).
 */

/** Wrong credentials or unknown account — generic on purpose. */
export class InvalidCredentialsError extends UnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}

/** Presented token is invalid, expired, of the wrong type, or revoked. */
export class InvalidTokenError extends UnauthorizedException {
  constructor(message = 'Invalid or expired token') {
    super(message);
  }
}

/** An email/identifier is already registered with the requested provider. */
export class AccountExistsError extends ConflictException {
  constructor(message = 'An account with these details already exists') {
    super(message);
  }
}

/** The account cannot authenticate in its current state (suspended, etc.). */
export class AccountNotActiveError extends UnauthorizedException {
  constructor(message = 'This account is not active') {
    super(message);
  }
}

/** Too many attempts — the caller is temporarily rate-limited/locked out. */
export class TooManyAttemptsError extends HttpException {
  constructor(
    message = 'Too many attempts, please try again later',
    /** Seconds until the caller may retry (surfaced via Retry-After upstream). */
    readonly retryAfterSeconds?: number,
  ) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/** Submitted OTP is wrong, expired, or was never requested. */
export class InvalidOtpError extends BadRequestException {
  constructor(message = 'The code is invalid or has expired') {
    super(message);
  }
}

/** A requested auth method is not configured on this deployment (e.g. Google). */
export class AuthMethodUnavailableError extends ServiceUnavailableException {
  constructor(message = 'This sign-in method is not available') {
    super(message);
  }
}
