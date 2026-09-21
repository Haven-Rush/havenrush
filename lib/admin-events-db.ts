import { prisma } from "@/lib/prisma";

/**
 * Admin-only queries and mutations for events/stops. Kept separate from
 * lib/events-db.ts (public read paths) since this file will grow to
 * include writes (create/update/delete) that the public site never does.
 */
export function listEventsForAdmin() {
  return prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { passes: true } } },
  });
}
