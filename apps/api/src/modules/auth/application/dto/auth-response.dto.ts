import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Response DTOs for the auth endpoints. Defined as Zod schemas so they render
 * in Swagger (via `patchNestJsSwagger`) and give the frontend a single typed
 * contract to consume.
 */

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  name: z.string().nullable(),
  handle: z.string().nullable(),
  locale: z.string(),
  status: z.string(),
  roles: z.array(z.string()),
});

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  /** Access-token lifetime in seconds. */
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
});

export const authResultSchema = z.object({
  user: userProfileSchema,
  tokens: tokenPairSchema,
});

export const otpRequestedSchema = z.object({
  message: z.string(),
  expiresInSeconds: z.number().int().positive(),
});

export const messageSchema = z.object({
  message: z.string(),
});

export class UserProfileDto extends createZodDto(userProfileSchema) {}
export class TokenPairDto extends createZodDto(tokenPairSchema) {}
export class AuthResultDto extends createZodDto(authResultSchema) {}
export class OtpRequestedDto extends createZodDto(otpRequestedSchema) {}
export class MessageDto extends createZodDto(messageSchema) {}

export type UserProfile = z.infer<typeof userProfileSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;
