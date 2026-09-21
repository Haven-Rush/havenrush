import { NextResponse } from "next/server";
import {
  formatEventDateLabel,
  getEventDetailBySlug,
  homesCount,
  hostingBrokerages,
  tastingStopsCount,
  topReward,
} from "@/lib/events-db";
import { parseRewardTiers } from "@/lib/reward-tiers";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventDetailBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    event: {
      slug: event.slug,
      title: event.title,
      type: event.type,
      neighborhood: event.neighborhood,
      city: event.city,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      dateLabel: formatEventDateLabel(event),
      description: event.description,
      rewardTiers: parseRewardTiers(event.rewardTiers),
      homesCount: homesCount(event),
      tastingStopsCount: tastingStopsCount(event),
      hostingBrokerages: hostingBrokerages(event),
      topReward: topReward(event) ?? null,
      sponsors: event.sponsors.map((sponsor) => ({ name: sponsor.name, role: sponsor.role })),
      // scanToken deliberately omitted: it's the stamp credential for this
      // stop, and this route is public. It only ever goes out via the QR
      // code printed/displayed at the physical stop (Phase 3/4 `/s/[token]`
      // scan landing), never through a JSON API a browser can read.
      stops: event.stops.map((stop) => ({
        order: stop.order,
        kind: stop.kind,
        name: stop.name,
        address: stop.address,
        brokerage: stop.agent?.brokerage ?? null,
        agentName: stop.agent?.name ?? null,
      })),
    },
  });
}
