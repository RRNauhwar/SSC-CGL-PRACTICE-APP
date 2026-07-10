import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Password hashing and verification using Argon2id — the algorithm mandated by
 * doc 15 (Security Architecture) and the current OWASP recommendation for
 * password storage.
 *
 * Argon2id parameters use the library defaults (memory 64 MiB, 3 iterations,
 * parallelism 4), which balance resistance to GPU/ASIC attacks against server
 * cost; they can be tuned centrally here without affecting callers.
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
  };

  /** Hash a plaintext password. The result embeds the algorithm + parameters. */
  hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options);
  }

  /**
   * Verify a plaintext password against a stored hash.
   * Returns `false` (never throws) on malformed hashes so callers can treat any
   * failure as "invalid credentials" uniformly.
   */
  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
