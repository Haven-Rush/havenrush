import type { NextRequest } from "next/server";

/** Vercel sets x-forwarded-for; fall back to a constant key in dev/local. */
export function getClientIp(request: NextRequest): string {
  return clientIpFromHeader(request.headers.get("x-forwarded-for"));
}

/** Same, for Server Actions (`await headers()`) rather than a route's NextRequest. */
export function getClientIpFromHeaders(headerList: { get(name: string): string | null }): string {
  return clientIpFromHeader(headerList.get("x-forwarded-for"));
}

function clientIpFromHeader(forwardedFor: string | null): string {
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
