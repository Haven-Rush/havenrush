import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * TEMPORARY -- verifies the Gather/Hunt/Explore/Market rename actually
 * reached the live production database (same Supabase project dev/preview/
 * prod all share -- see CLAUDE.md), not just that the build passed. Remove
 * once confirmed (see DECISIONS.md).
 *
 * Deliberately returns only event titles/types (already public via
 * GET /api/events) -- no scanTokens, no attendee data.
 */
const RETIRED_NAME_PHRASES = ["House Party", "Home Hunt", "Open House Weekend", "Home Fair"];
const EXPECTED_TYPES = ["GATHER", "HUNT", "EXPLORE", "MARKET"];
const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(`health-rename-check:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const events = await prisma.event.findMany({
    select: { slug: true, title: true, type: true },
    orderBy: { startsAt: "asc" },
  });

  const typesPresent = Array.from(new Set(events.map((e) => e.type))).sort();
  const unexpectedTypes = typesPresent.filter((t) => !EXPECTED_TYPES.includes(t));

  const titlesWithRetiredNames = events
    .filter((e) => RETIRED_NAME_PHRASES.some((phrase) => e.title.includes(phrase)))
    .map((e) => ({ slug: e.slug, title: e.title }));

  return NextResponse.json({
    ok: unexpectedTypes.length === 0 && titlesWithRetiredNames.length === 0,
    eventCount: events.length,
    events: events.map((e) => ({ slug: e.slug, title: e.title, type: e.type })),
    typesPresent,
    unexpectedTypes,
    titlesWithRetiredNames,
  });
}
