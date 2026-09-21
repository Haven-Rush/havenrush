import Link from "next/link";
import { EVENT_TYPES } from "@/lib/event-types";
import { formatEventDateLabel } from "@/lib/events-db";
import { listEventsForAdmin } from "@/lib/admin-events-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events | Haven Rush Admin",
};

export default async function AdminEventsPage() {
  const events = await listEventsForAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="whitespace-nowrap rounded-full bg-sage px-5 py-2.5 text-[13px] font-bold text-linen no-underline hover:bg-sage-dark"
        >
          New event
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-charcoal/10 text-[11px] uppercase tracking-wide text-charcoal/50">
              <th className="px-4 py-3 font-bold">Title</th>
              <th className="px-4 py-3 font-bold">Type</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">RSVPs</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-charcoal/8 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="font-semibold text-sage no-underline hover:underline"
                  >
                    {event.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-charcoal/70">{EVENT_TYPES[event.type].label}</td>
                <td className="px-4 py-3 text-charcoal/70">{formatEventDateLabel(event)}</td>
                <td className="px-4 py-3 text-charcoal/70">{event._count.passes}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-charcoal/50">
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
