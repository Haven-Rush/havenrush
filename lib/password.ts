import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Shared scrypt password hashing. Used for the single shared admin
 * password (ADMIN_PASSWORD_HASH env var, see lib/admin-auth.ts) and for
 * per-host passwords stored on Host.passwordHash (lib/host-auth.ts) --
 * same hashing approach, different storage (env var vs. a DB column per
 * account).
 */

const SCRYPT_KEYLEN = 64;

/** Hashes a password as "salt:hash" (both hex). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/** Verifies a password against a stored "salt:hash" string. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
