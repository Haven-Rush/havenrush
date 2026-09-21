import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONSENT_TEXT } from "@/lib/site-config";
import type { Intent, Timeline } from "@prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS: Intent[] = ["BUYING", "RENTING"];
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
    include: { stops: { include: { agent: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const pass = await prisma.$transaction(async (tx) => {
    const attendee = await tx.attendee.upsert({
      where: { email },
      update: name ? { name } : {},
      create: { email, name },
    });

    const consentedAt = agentContactConsent ? new Date() : null;
    const upsertedPass = await tx.pass.upsert({
      where: { attendeeId_eventId: { attendeeId: attendee.id, eventId: event.id } },
      update: { intent, timeline, agentContactConsent, consentedAt, consentText: CONSENT_TEXT },
      create: {
        token: randomUUID(),
        attendeeId: attendee.id,
        eventId: event.id,
        intent,
        timeline,
        agentContactConsent,
        consentedAt,
        consentText: CONSENT_TEXT,
      },
    });

    // Consent before any lead leaves the system: only ever queue a
    // LeadDelivery when the attendee explicitly opted in. No consent means
    // no row is created at all, so there is nothing for a future dispatcher
    // to send.
    if (agentContactConsent) {
      const agentIds = Array.from(
        new Set(
          event.stops
            .filter((stop) => stop.kind === "LISTING" && stop.agentId)
            .map((stop) => stop.agentId as string),
        ),
      );

      for (const agentId of agentIds) {
        const existing = await tx.leadDelivery.findFirst({
          where: { passId: upsertedPass.id, agentId },
        });
        if (!existing) {
          await tx.leadDelivery.create({
            data: { passId: upsertedPass.id, agentId },
          });
        }
      }
    }

    return upsertedPass;
  });

  return NextResponse.json({ token: pass.token }, { status: 201 });
}
