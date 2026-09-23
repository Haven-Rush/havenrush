import { createSignedToken, verifySignedToken } from "./session-token";

/**
 * Per-host session (distinct from the single shared admin session in
 * lib/admin-auth.ts): each Host row has its own passwordHash (lib/password.ts),
 * and a valid session cookie carries that host's id so /host pages know
 * which account is signed in.
 */

export const HOST_SESSION_COOKIE = "host_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function createHostSessionCookieValue(hostId: string): string {
  return createSignedToken({ hostId }, SESSION_TTL_MS);
}

/** Verifies a host session cookie and returns the signed-in host's id, or null. */
export function getHostIdFromSessionCookieValue(value: string | undefined | null): string | null {
  const payload = verifySignedToken(value);
  return typeof payload?.hostId === "string" ? payload.hostId : null;
}
