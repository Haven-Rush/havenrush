import Link from "next/link";
import { EVENT_TYPES } from "@/lib/event-types";
import { formatEventDateLabel, listEvents } from "@/lib/events-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upcoming hunts | Haven Rush",
};

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
      <h1 className="mb-9 font-serif text-[clamp(26px,3.6vw,36px)] font-bold">Upcoming hunts</h1>
      <div className="flex flex-col">
        {events.map((event, index) => (
          <div
            key={event.slug}
            className={`flex flex-wrap items-center justify-between gap-4 py-[22px] ${
              index < events.length - 1 ? "border-b border-charcoal/10" : ""
            }`}
          >
            <div>
              <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
                {EVENT_TYPES[event.type].label}
              </div>
              <div className="mb-1 font-serif text-[19px] font-bold">{event.title}</div>
              <div className="text-[13px] text-charcoal/60">{formatEventDateLabel(event)}</div>
            </div>
            <Link
              href={`/events/${event.slug}`}
              className="whitespace-nowrap rounded-full border border-sage/20 bg-linen px-5 py-2.5 text-[13px] font-bold text-sage no-underline hover:border-sage/40"
            >
              Get Pass
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
