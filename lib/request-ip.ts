import type { NextRequest } from "next/server";

/** Vercel sets x-forwarded-for; fall back to a constant key in dev/local. */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
