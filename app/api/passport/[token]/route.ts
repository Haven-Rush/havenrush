import { NextResponse } from "next/server";
import { computePassProgress, getPassByToken } from "@/lib/passport-db";
import { formatEventDateLabel } from "@/lib/events-db";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const pass = await getPassByToken(token);

  if (!pass) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }

  const stampedStopIds = new Set(pass.stamps.map((stamp) => stamp.stopId));
  const progress = computePassProgress(pass.event.rewardTiers, stampedStopIds.size);

  return NextResponse.json({
    pass: {
      token: pass.token,
      intent: pass.intent,
      timeline: pass.timeline,
      event: {
        slug: pass.event.slug,
        title: pass.event.title,
        neighborhood: pass.event.neighborhood,
        city: pass.event.city,
        dateLabel: formatEventDateLabel(pass.event),
      },
      stops: pass.event.stops.map((stop) => ({
        order: stop.order,
        kind: stop.kind,
        name: stop.name,
        stamped: stampedStopIds.has(stop.id),
      })),
      stampedCount: progress.stampedCount,
      nextTier: progress.nextTier ?? null,
      currentReward: progress.currentReward ?? null,
      progressPct: progress.progressPct,
    },
  });
}
