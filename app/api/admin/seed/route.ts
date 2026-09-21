import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/prisma/seed-runner";

/**
 * One-time (but safe to re-trigger) seed endpoint for Vercel, where the
 * app has DATABASE_URL/DIRECT_URL but this session/CLI doesn't. Protected
 * by a shared secret rather than left open, since it writes to the DB.
 * `runSeed` is entirely upserts (see prisma/seed-runner.ts), so re-running
 * it — on redeploys, or by hand — never duplicates rows.
 *
 * Trigger with:
 *   curl -X POST https://<your-domain>/api/admin/seed \
 *     -H "x-seed-secret: $SEED_SECRET"
 */
export async function POST(request: Request) {
  const configuredSecret = process.env.SEED_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Seeding is disabled: SEED_SECRET is not set" },
      { status: 501 },
    );
  }

  const providedSecret = request.headers.get("x-seed-secret") ?? "";
  const configured = Buffer.from(configuredSecret);
  const provided = Buffer.from(providedSecret);
  const authorized =
    configured.length === provided.length && timingSafeEqual(configured, provided);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runSeed(prisma);

  return NextResponse.json({ ok: true });
}
