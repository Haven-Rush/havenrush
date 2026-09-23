import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { CONSENT_TEXT } from "@/lib/site-config";
import type { Intent, Pass, Timeline } from "@prisma/client";

export type CreatePassInput = {
  eventId: string;
  email: string;
  name?: string;
  intent: Intent;
  timeline: Timeline;
  agentContactConsent: boolean;
  /** Distinct Agent ids behind this event's LISTING stops (caller already
   * has the event's stops loaded to validate/price the request, so it
   * computes this rather than the transaction re-querying it). */
  listingAgentIds: string[];
};

/**
 * Upserts the Attendee + Pass for one RSVP and queues LeadDelivery rows on
 * consent. Shared by POST /api/rsvp (free events) and the
 * checkout.session.completed webhook (paid events) so the consent/
 * lead-delivery logic -- a product-rule-sensitive concern (CLAUDE.md rule
 * 2) -- has exactly one implementation instead of two copies that could
 * drift apart.
 */
export async function createOrUpdatePass(input: CreatePassInput): Promise<Pass> {
  return prisma.$transaction(async (tx) => {
    const attendee = await tx.attendee.upsert({
      where: { email: input.email },
      update: input.name ? { name: input.name } : {},
      create: { email: input.email, name: input.name },
    });

    const consentedAt = input.agentContactConsent ? new Date() : null;
    const pass = await tx.pass.upsert({
      where: { attendeeId_eventId: { attendeeId: attendee.id, eventId: input.eventId } },
      update: {
        intent: input.intent,
        timeline: input.timeline,
        agentContactConsent: input.agentContactConsent,
        consentedAt,
        consentText: CONSENT_TEXT,
      },
      create: {
        token: randomUUID(),
        attendeeId: attendee.id,
        eventId: input.eventId,
        intent: input.intent,
        timeline: input.timeline,
        agentContactConsent: input.agentContactConsent,
        consentedAt,
        consentText: CONSENT_TEXT,
      },
    });

    // Consent before any lead leaves the system: only ever queue a
    // LeadDelivery when the attendee explicitly opted in. No consent means
    // no row is created at all, so there is nothing for a future dispatcher
    // to send.
    if (input.agentContactConsent) {
      for (const agentId of input.listingAgentIds) {
        const existing = await tx.leadDelivery.findFirst({
          where: { passId: pass.id, agentId },
        });
        if (!existing) {
          await tx.leadDelivery.create({ data: { passId: pass.id, agentId } });
        }
      }
    }

    return pass;
  });
}

/** Distinct Agent ids behind an event's LISTING stops. */
export function listingAgentIds(stops: { kind: string; agentId: string | null }[]): string[] {
  return Array.from(
    new Set(
      stops.filter((stop) => stop.kind === "LISTING" && stop.agentId).map((stop) => stop.agentId as string),
    ),
  );
}
