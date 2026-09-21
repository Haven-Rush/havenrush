import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Minimal, dependency-free admin auth: a single shared password (hashed
 * with scrypt, stored in ADMIN_PASSWORD_HASH) gates a signed session
 * cookie (HMAC-SHA256 with SESSION_SECRET). No user accounts, no DB
 * session table — this is intentionally not a full auth library.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Builds a new signed session cookie value, valid for SESSION_TTL_MS. */
export function createSessionCookieValue(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

/** Verifies a session cookie value's signature and expiry. */
export function isValidSessionCookieValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;
  if (!timingSafeEqualHex(signature, sign(encoded))) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

const SCRYPT_KEYLEN = 64;

/** Hashes a password as "salt:hash" (both hex). Used by the one-time setup script. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/** Verifies a password against a stored "salt:hash" string (ADMIN_PASSWORD_HASH). */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
