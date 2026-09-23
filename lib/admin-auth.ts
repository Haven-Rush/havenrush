import { createSignedToken, verifySignedToken } from "./session-token";

/**
 * Minimal, dependency-free admin auth: a single shared password (hashed
 * with scrypt, stored in ADMIN_PASSWORD_HASH) gates a signed session
 * cookie. No user accounts, no DB session table -- this is intentionally
 * not a full auth library.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/** Builds a new signed session cookie value, valid for SESSION_TTL_MS. */
export function createSessionCookieValue(): string {
  return createSignedToken({}, SESSION_TTL_MS);
}

/** Verifies a session cookie value's signature and expiry. */
export function isValidSessionCookieValue(value: string | undefined | null): boolean {
  return verifySignedToken(value) !== null;
}

export { hashPassword, verifyPassword } from "./password";
