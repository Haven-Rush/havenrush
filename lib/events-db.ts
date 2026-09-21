import type { Agent, Event, Sponsor, Stop } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseRewardTiers } from "@/lib/reward-tiers";

export type StopWithAgent = Stop & { agent: Agent | null };
export type EventWithStops = Event & { stops: StopWithAgent[] };
export type EventDetail = Event & { stops: StopWithAgent[]; sponsors: Sponsor[] };

export function listEvents() {
  return prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    include: { stops: { include: { agent: true } } },
  });
}

export function getEventDetailBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      stops: { orderBy: { order: "asc" }, include: { agent: true } },
      sponsors: true,
    },
  });
}

export function homesCount(event: EventWithStops): number {
  return event.stops.filter((stop) => stop.kind === "LISTING").length;
}

export function tastingStopsCount(event: EventWithStops): number {
  return event.stops.filter((stop) => stop.kind === "COFFEE" || stop.kind === "FOOD").length;
}

export function hostingBrokerages(event: EventWithStops): string[] {
  const names = event.stops
    .filter((stop) => stop.kind === "LISTING" && stop.agent)
    .map((stop) => stop.agent!.brokerage);
  return Array.from(new Set(names));
}

export function topReward(event: Event): string | undefined {
  const tiers = parseRewardTiers(event.rewardTiers);
  return tiers[0]?.reward;
}

/**
 * Approximates the mockup/seed data's hand-written `dateLabel` strings
 * (e.g. "Sat, Oct 24 · South Congress, Austin") from the real
 * `startsAt`/`endsAt` columns. Placeholder data is Austin-only for now
 * (see CLAUDE.md), hence the fixed `America/Chicago` zone — this should
 * become per-event once markets outside Central time are seeded.
 */
export function formatEventDateLabel(event: Event): string {
  const timeZone = "America/Chicago";
  // Compare calendar dates in `timeZone`, not the server's local zone (UTC
  // on Vercel) — `.toDateString()` disagreed with the zoned output below
  // whenever an event's start/end crossed a UTC day boundary without
  // crossing a Central one, producing "Oct 24–24" instead of "Oct 24".
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const sameDay = dateKey.format(event.startsAt) === dateKey.format(event.endsAt);

  if (sameDay) {
    const formatted = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    }).format(event.startsAt);
    return `${formatted} · ${event.neighborhood}, ${event.city}`;
  }

  const startFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(event.startsAt);
  const endFormatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone,
  }).format(event.endsAt);
  return `${startFormatted}–${endFormatted} · ${event.neighborhood}`;
}
