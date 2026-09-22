import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseRewardTiers } from "@/lib/reward-tiers";
import { toDateTimeLocalValue } from "@/lib/admin-datetime";
import { EventForm } from "@/components/admin/event-form";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const boundUpdateEvent = updateEvent.bind(null, event.id);
  const tiers = parseRewardTiers(event.rewardTiers);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold">{event.title}</h1>
        <div className="flex gap-4 text-[13px] font-bold">
          <Link
            href={`/admin/events/${event.id}/stops`}
            className="text-sage no-underline hover:underline"
          >
            Stops →
          </Link>
          <Link
            href={`/admin/events/${event.id}/rsvps`}
            className="text-sage no-underline hover:underline"
          >
            RSVPs →
          </Link>
        </div>
      </div>

      <EventForm
        action={boundUpdateEvent}
        submitLabel="Save changes"
        defaultValues={{
          title: event.title,
          slug: event.slug,
          type: event.type,
          purpose: event.purpose ?? "",
          neighborhood: event.neighborhood,
          city: event.city,
          startsAt: toDateTimeLocalValue(event.startsAt),
          endsAt: toDateTimeLocalValue(event.endsAt),
          description: event.description,
          rewardTiers: tiers.map((tier) => ({ stops: String(tier.stops), reward: tier.reward })),
        }}
      />
    </div>
  );
}
