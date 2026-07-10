import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Request DTOs for the auth endpoints.
 *
 * Each is a Zod schema wrapped with `createZodDto`, so the global
 * `ZodValidationPipe` validates/normalizes input and `@nestjs/swagger` renders
 * the schema in the OpenAPI document.
 */

const email = z.string().trim().toLowerCase().email();
// Bounded to protect the argon2 hasher from excessively long inputs (DoS).
const password = z.string().min(8).max(128);
const otpCode = z
  .string()
  .trim()
  .regex(/^\d{4,10}$/, 'Code must be 4–10 digits');

export class RegisterDto extends createZodDto(
  z.object({
    email,
    password,
    name: z.string().trim().min(1).max(120).optional(),
  }),
) {}

export class LoginDto extends createZodDto(
  z.object({
    email,
    password,
  }),
) {}

export class RequestOtpDto extends createZodDto(
  z.object({
    email,
  }),
) {}

export class VerifyOtpDto extends createZodDto(
  z.object({
    email,
    code: otpCode,
  }),
) {}

export class GoogleLoginDto extends createZodDto(
  z.object({
    /** Google-issued ID token obtained on the client via Google Sign-In. */
    idToken: z.string().min(10),
  }),
) {}

export class RefreshDto extends createZodDto(
  z.object({
    refreshToken: z.string().min(10),
  }),
) {}
