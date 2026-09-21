import { NextResponse } from "next/server";
import {
  formatEventDateLabel,
  homesCount,
  hostingBrokerages,
  listEvents,
  tastingStopsCount,
  topReward,
} from "@/lib/events-db";

export async function GET() {
  const events = await listEvents();

  return NextResponse.json({
    events: events.map((event) => ({
      slug: event.slug,
      title: event.title,
      type: event.type,
      neighborhood: event.neighborhood,
      city: event.city,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      dateLabel: formatEventDateLabel(event),
      homesCount: homesCount(event),
      tastingStopsCount: tastingStopsCount(event),
      hostingBrokerages: hostingBrokerages(event),
      topReward: topReward(event) ?? null,
    })),
  });
}
