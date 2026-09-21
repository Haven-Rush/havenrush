import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

// Stricter than /api/stamps/scan's per-(ip,passToken) limit: this is an
// email-guessing surface (event + email -> a pass token), so it's limited
// per IP with no secondary key to widen against.
const RATE_LIMIT = { limit: 10, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LookupBody = {
  eventSlug?: unknown;
  email?: unknown;
};

/**
 * Fallback for the /s/[scanToken] check-in flow when a device has no
 * locally stored pass token: find the attendee's existing pass for this
 * event by the email they RSVP'd with. No login — this is the recovery
 * path in place of one.
 */
export async function POST(request: NextRequest) {
  let body: LookupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug : undefined;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  if (!eventSlug || !email) {
    return NextResponse.json({ error: "eventSlug and email are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(`passport-lookup:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const pass = await prisma.pass.findFirst({
    where: { event: { slug: eventSlug }, attendee: { email } },
    select: { token: true },
  });

  if (!pass) {
    return NextResponse.json(
      { error: "No pass found for that email. Have you RSVP'd to this event?" },
      { status: 404 },
    );
  }

  return NextResponse.json({ token: pass.token });
}
