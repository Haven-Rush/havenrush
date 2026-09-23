import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Generic signed, expiring token: base64url(JSON payload).HMAC-SHA256(...).
 * Shared by lib/admin-auth.ts (a single shared session, empty payload) and
 * lib/host-auth.ts (a per-host session, payload carries hostId) so the
 * signing/verification logic isn't duplicated between the two.
 */

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

export function createSignedToken(payload: Record<string, unknown>, ttlMs: number): string {
  const encoded = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + ttlMs }),
    "utf8",
  ).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

/** Verifies signature + expiry, returning the payload (with `exp`) or null. */
export function verifySignedToken(
  value: string | undefined | null,
): (Record<string, unknown> & { exp: number }) | null {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  if (!timingSafeEqualHex(signature, sign(encoded))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof payload.exp === "number" && payload.exp > Date.now()) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}
