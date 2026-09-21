import { PrismaClient } from "@prisma/client";
import { CONSENT_TEXT } from "../lib/site-config";
import { EVENTS, SEED_PASSES, getEventBySlug } from "../lib/seed-data";

/**
 * Idempotent by construction: every write below is an upsert (or an
 * existence check before create), keyed on each table's natural unique
 * field (email, slug, scanToken, token, passId+stopId). Running this
 * repeatedly updates existing rows in place rather than duplicating them,
 * which is what lets `prisma/seed.ts` (CLI) and `/api/admin/seed` (a
 * one-time trigger once Vercel has DATABASE_URL) share this function.
 */
export async function runSeed(prisma: PrismaClient): Promise<void> {
  const agentsByKey = new Map<string, { name: string; brokerage: string }>();
  for (const event of EVENTS) {
    for (const stop of event.stops) {
      if (stop.kind === "LISTING" && stop.agentName && stop.brokerage) {
        agentsByKey.set(`${stop.agentName}::${stop.brokerage}`, {
          name: stop.agentName,
          brokerage: stop.brokerage,
        });
      }
    }
  }

  const agentIdByKey = new Map<string, string>();
  for (const [key, { name, brokerage }] of agentsByKey) {
    const slug = brokerage.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const agent = await prisma.agent.upsert({
      where: { email: `${slug}@example.com` },
      update: {},
      create: {
        name,
        brokerage,
        email: `${slug}@example.com`,
      },
    });
    agentIdByKey.set(key, agent.id);
  }

  for (const seedEvent of EVENTS) {
    const event = await prisma.event.upsert({
      where: { slug: seedEvent.slug },
      update: {
        title: seedEvent.title,
        type: seedEvent.type,
        neighborhood: seedEvent.neighborhood,
        city: seedEvent.city,
        startsAt: new Date(seedEvent.startsAt),
        endsAt: new Date(seedEvent.endsAt),
        description: seedEvent.description,
        rewardTiers: seedEvent.rewardTiers,
      },
      create: {
        slug: seedEvent.slug,
        title: seedEvent.title,
        type: seedEvent.type,
        neighborhood: seedEvent.neighborhood,
        city: seedEvent.city,
        startsAt: new Date(seedEvent.startsAt),
        endsAt: new Date(seedEvent.endsAt),
        description: seedEvent.description,
        rewardTiers: seedEvent.rewardTiers,
      },
    });

    for (const sponsor of seedEvent.sponsors) {
      const existing = await prisma.sponsor.findFirst({
        where: { eventId: event.id, name: sponsor.name },
      });
      if (!existing) {
        await prisma.sponsor.create({
          data: { eventId: event.id, name: sponsor.name, role: sponsor.role },
        });
      }
    }

    for (const stop of seedEvent.stops) {
      const agentKey =
        stop.agentName && stop.brokerage ? `${stop.agentName}::${stop.brokerage}` : undefined;
      await prisma.stop.upsert({
        where: { scanToken: stop.scanToken },
        update: {
          eventId: event.id,
          order: stop.order,
          kind: stop.kind,
          name: stop.name,
          address: stop.address,
          agentId: agentKey ? agentIdByKey.get(agentKey) : undefined,
        },
        create: {
          eventId: event.id,
          order: stop.order,
          kind: stop.kind,
          name: stop.name,
          address: stop.address,
          scanToken: stop.scanToken,
          agentId: agentKey ? agentIdByKey.get(agentKey) : undefined,
        },
      });
    }
  }

  for (const seedPass of SEED_PASSES) {
    const event = getEventBySlug(seedPass.eventSlug);
    if (!event) continue;
    const dbEvent = await prisma.event.findUniqueOrThrow({ where: { slug: event.slug } });

    const attendee = await prisma.attendee.upsert({
      where: { email: `${seedPass.attendeeName.toLowerCase()}@example.com` },
      update: {},
      create: {
        name: seedPass.attendeeName,
        email: `${seedPass.attendeeName.toLowerCase()}@example.com`,
      },
    });

    const pass = await prisma.pass.upsert({
      where: { token: seedPass.token },
      update: {},
      create: {
        token: seedPass.token,
        attendeeId: attendee.id,
        eventId: dbEvent.id,
        intent: seedPass.intent,
        timeline: seedPass.timeline,
        agentContactConsent: false,
        consentText: CONSENT_TEXT,
      },
    });

    for (const seedStopId of seedPass.stampedStopIds) {
      const seedStop = event.stops.find((s) => s.id === seedStopId);
      if (!seedStop) continue;
      const dbStop = await prisma.stop.findUniqueOrThrow({
        where: { scanToken: seedStop.scanToken },
      });
      await prisma.stamp.upsert({
        where: { passId_stopId: { passId: pass.id, stopId: dbStop.id } },
        update: {},
        create: { passId: pass.id, stopId: dbStop.id },
      });
    }
  }
}
