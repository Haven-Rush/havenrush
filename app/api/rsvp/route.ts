import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrUpdatePass, listingAgentIds } from "@/lib/create-pass";
import type { Intent, Timeline } from "@prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS: Intent[] = ["EXPLORING", "BUYING", "RENTING"];
const TIMELINES: Timeline[] = ["JUST_LOOKING", "MOVING_SOON"];

type RsvpBody = {
  eventSlug?: unknown;
  email?: unknown;
  name?: unknown;
  intent?: unknown;
  timeline?: unknown;
  agentContactConsent?: unknown;
};

export async function POST(request: Request) {
  let body: RsvpBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug : undefined;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined;
  const intent = INTENTS.includes(body.intent as Intent) ? (body.intent as Intent) : undefined;
  const timeline = TIMELINES.includes(body.timeline as Timeline)
    ? (body.timeline as Timeline)
    : undefined;
  // Unchecked by default at the client — only an explicit `true` counts as consent.
  const agentContactConsent = body.agentContactConsent === true;

  if (!eventSlug || !email || !intent || !timeline) {
    return NextResponse.json(
      { error: "eventSlug, email, intent, and timeline are required" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { stops: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (event.priceCents > 0) {
    return NextResponse.json(
      { error: "This event requires payment — use /api/checkout instead" },
      { status: 400 },
    );
  }

  const pass = await createOrUpdatePass({
    eventId: event.id,
    email,
    name,
    intent,
    timeline,
    agentContactConsent,
    listingAgentIds: listingAgentIds(event.stops),
  });

  return NextResponse.json({ token: pass.token }, { status: 201 });
}
