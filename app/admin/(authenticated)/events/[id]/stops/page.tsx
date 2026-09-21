import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StopsManager } from "@/components/admin/stops-manager";

export const dynamic = "force-dynamic";

export default async function EventStopsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [event, stops, agents] = await Promise.all([
    prisma.event.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.stop.findMany({ where: { eventId: id }, orderBy: { order: "asc" } }),
    prisma.agent.findMany({ orderBy: { brokerage: "asc" } }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="mb-1 block text-[13px] font-semibold text-sage no-underline"
          >
            ← {event.title}
          </Link>
          <h1 className="font-serif text-2xl font-bold">Stops</h1>
        </div>
      </div>

      <StopsManager
        eventId={event.id}
        stops={stops}
        agents={agents.map((agent) => ({
          id: agent.id,
          name: agent.name,
          brokerage: agent.brokerage,
        }))}
      />
    </div>
  );
}
