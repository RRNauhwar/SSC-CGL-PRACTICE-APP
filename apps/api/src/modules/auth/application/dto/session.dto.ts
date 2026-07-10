import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Response DTO describing an active session/device for the "manage your
 * sessions" screen (doc 15 — session & device management).
 */
export const sessionSchema = z.object({
  id: z.string().uuid(),
  /** True for the session the current request is authenticated with. */
  current: z.boolean(),
  deviceName: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
  lastUsedAt: z.string(),
  expiresAt: z.string(),
});

export class SessionDto extends createZodDto(sessionSchema) {}

export type SessionView = z.infer<typeof sessionSchema>;
