import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/events-db";
import { countStopsForEvent, getStopByScanToken } from "@/lib/scan-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * TEMPORARY diagnostic route — confirms the deployed app can reach
 * Postgres and that seeded events + a real scanToken resolve correctly,
 * run from *inside* the deployment (added because this sandbox's network
 * egress policy blocks fetching havenrush.com directly). Remove once
 * confirmed working — see DECISIONS.md.
 *
 * Never echoes a scanToken back (CLAUDE.md: never expose one in a JSON
 * response) — only booleans/counts derived from looking one up.
 */

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(`health-self-check:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  try {
    const events = await listEvents();

    const eventWithStop = events.find((event) => event.stops.length > 0);
    let scanTokenLookup: Record<string, unknown> = { tested: false };
    if (eventWithStop) {
      const stop = eventWithStop.stops[0];
      const resolved = await getStopByScanToken(stop.scanToken);
      const totalStops = await countStopsForEvent(eventWithStop.id);
      scanTokenLookup = {
        tested: true,
        eventSlug: eventWithStop.slug,
        resolvedCorrectStop: resolved?.id === stop.id,
        resolvedCorrectEvent: resolved?.event.id === eventWithStop.id,
        totalStopsForEvent: totalStops,
        totalStopsMatchesQuery: totalStops === eventWithStop.stops.length,
      };
    }

    const invalidLookup = await getStopByScanToken("self-check-invalid-token-does-not-exist");

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      events: {
        count: events.length,
        slugs: events.map((event) => event.slug),
      },
      scanTokenLookup,
      invalidScanTokenLookup: {
        resolvedToNull: invalidLookup === null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
