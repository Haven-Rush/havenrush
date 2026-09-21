import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const RATE_LIMIT = { limit: 20, windowMs: 60_000 };

type ScanBody = {
  passToken?: unknown;
  scanToken?: unknown;
};

export async function POST(request: NextRequest) {
  let body: ScanBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const passToken = typeof body.passToken === "string" ? body.passToken : undefined;
  const scanToken = typeof body.scanToken === "string" ? body.scanToken : undefined;
  if (!passToken || !scanToken) {
    return NextResponse.json({ error: "passToken and scanToken are required" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const rateLimitKey = `stamps-scan:${ip}:${passToken}`;
  const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many scan attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const pass = await prisma.pass.findUnique({ where: { token: passToken } });
  if (!pass) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }

  const stop = await prisma.stop.findUnique({ where: { scanToken } });
  if (!stop) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }
  if (stop.eventId !== pass.eventId) {
    return NextResponse.json(
      { error: "This stop doesn't belong to this pass's event" },
      { status: 400 },
    );
  }

  // Idempotent: a stamp already exists for this pass/stop pair, so a
  // duplicate scan (double-tap, retried request) succeeds without erroring
  // or creating a second row. `passId_stopId` is a DB-level unique
  // constraint, so a create-race is caught below rather than prevented.
  let alreadyStamped = true;
  const existing = await prisma.stamp.findUnique({
    where: { passId_stopId: { passId: pass.id, stopId: stop.id } },
  });
  if (!existing) {
    try {
      await prisma.stamp.create({ data: { passId: pass.id, stopId: stop.id } });
      alreadyStamped = false;
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }
  }

  const stampedCount = await prisma.stamp.count({ where: { passId: pass.id } });

  return NextResponse.json({
    stamped: true,
    alreadyStamped,
    stop: { name: stop.name, kind: stop.kind },
    stampedCount,
  });
}
