/**
 * Token and authentication domain types shared across the auth module.
 * Framework-agnostic: no NestJS or Prisma imports here.
 */

/** Discriminates the two JWT kinds so an access token can never be used as a refresh token. */
export type TokenType = 'access' | 'refresh';

/**
 * Claims embedded in the short-lived access token. Roles are embedded so
 * authorization checks are stateless (no DB hit per request); they refresh
 * within one access-token TTL when roles change.
 */
export interface AccessTokenClaims {
  /** Subject — the user id. */
  sub: string;
  /** Session id this token belongs to (enables single-session revocation). */
  sid: string;
  roles: string[];
  type: 'access';
}

/** Claims embedded in the long-lived refresh token. */
export interface RefreshTokenClaims {
  sub: string;
  /** Session id (rotated on every refresh). */
  sid: string;
  /** Rotation family id (constant across the login's rotations). */
  fid: string;
  type: 'refresh';
}

/** Standard registered JWT claims added by the signer/verifier. */
export interface RegisteredClaims {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export type VerifiedAccessToken = AccessTokenClaims & RegisteredClaims;
export type VerifiedRefreshToken = RefreshTokenClaims & RegisteredClaims;

/**
 * The authenticated principal attached to each request by the JWT guard.
 * Controllers read this via the `@CurrentUser()` decorator.
 */
export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  roles: string[];
}

/** A freshly issued access/refresh token pair returned to clients. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds (clients use this to schedule refreshes). */
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Contextual metadata captured at authentication time for session/device
 * management and audit (doc 15).
 */
export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  /** Stable client device identifier (from the `x-device-id` header). */
  deviceId?: string;
  deviceName?: string;
}

/** Purpose of a one-time password. Extensible (e.g. VERIFY_EMAIL, RESET) later. */
export enum OtpPurpose {
  LOGIN = 'login',
}
