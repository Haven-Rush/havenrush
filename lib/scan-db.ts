import { prisma } from "@/lib/prisma";

export function getStopByScanToken(scanToken: string) {
  return prisma.stop.findUnique({
    where: { scanToken },
    include: {
      event: {
        select: { id: true, slug: true, title: true, startsAt: true, endsAt: true },
      },
    },
  });
}

export function countStopsForEvent(eventId: string): Promise<number> {
  return prisma.stop.count({ where: { eventId } });
}

export function isEventLive(
  event: { startsAt: Date; endsAt: Date },
  now: Date = new Date(),
): boolean {
  return now >= event.startsAt && now <= event.endsAt;
}
