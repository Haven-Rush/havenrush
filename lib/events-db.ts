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
  // Compare calendar days *in timeZone*, not via toDateString() (server
  // local time — UTC on Vercel). An event like 3pm-7pm Central crosses
  // midnight UTC, so toDateString() saw it as two different days and this
  // always fell into the multi-day branch below, rendering single-day
  // events as e.g. "Oct 24–24" instead of "Oct 24".
  const dayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const sameDay = dayKey.format(event.startsAt) === dayKey.format(event.endsAt);

  if (sameDay) {
    const formatted = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    }).format(event.startsAt);
    return `${formatted} · ${event.neighborhood}, ${event.city}`;
  }

  const monthKey = new Intl.DateTimeFormat("en-US", { timeZone, month: "short" });
  const sameMonth = monthKey.format(event.startsAt) === monthKey.format(event.endsAt);

  const startFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone,
  }).format(event.startsAt);
  const endFormatted = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    timeZone,
  }).format(event.endsAt);
  return `${startFormatted}–${endFormatted} · ${event.neighborhood}`;
}
