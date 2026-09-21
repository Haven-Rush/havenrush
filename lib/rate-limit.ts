/**
 * Best-effort, in-memory, fixed-window rate limiter. Good enough for a
 * single serverless instance; state resets on cold start and isn't shared
 * across instances. If /api/stamps/scan needs real multi-instance limits
 * at scale, swap this for a shared store (e.g. Upstash Redis) — see
 * DECISIONS.md.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
