"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EVENT_PURPOSES, EVENT_TYPE_ORDER, EVENT_TYPES, type EventType } from "@/lib/event-types";
import type { EventPurpose } from "@prisma/client";

export type BrowseEvent = {
  slug: string;
  title: string;
  type: EventType;
  purpose: EventPurpose | null;
  neighborhood: string;
  city: string;
  dateLabel: string;
};

const FILTERS: { value: EventType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  ...EVENT_TYPE_ORDER.map((type) => ({ value: type, label: EVENT_TYPES[type].label })),
];

export function HomeBrowse({ events }: { events: BrowseEvent[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EventType | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      if (filter !== "ALL" && event.type !== filter) return false;
      if (!q) return true;
      return (
        event.title.toLowerCase().includes(q) ||
        event.neighborhood.toLowerCase().includes(q) ||
        event.city.toLowerCase().includes(q)
      );
    });
  }, [events, query, filter]);

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-4 rounded-2xl border border-charcoal/6 bg-white p-2 shadow-[0_12px_30px_rgba(31,36,33,0.08)]">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by city, neighborhood, or place"
            aria-label="Search events"
            className="w-full rounded-xl border-0 bg-transparent px-3.5 py-3 text-[15px] text-charcoal outline-none placeholder:text-charcoal/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold no-underline transition-colors ${
                filter === option.value
                  ? "bg-sage text-linen"
                  : "border border-charcoal/12 bg-white text-charcoal/70 hover:border-sage/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-charcoal/10 bg-white px-4 py-12 text-center text-charcoal/50">
            No events match yet. Try a different search or filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event }: { event: BrowseEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex flex-col overflow-hidden rounded-[18px] border border-charcoal/8 bg-white no-underline transition-shadow hover:shadow-[0_12px_30px_rgba(31,36,33,0.08)]"
    >
      <div
        aria-hidden
        className="h-32 bg-[repeating-linear-gradient(135deg,rgba(46,90,68,0.08)_0px,rgba(46,90,68,0.08)_12px,transparent_12px,transparent_24px)] bg-sage/5"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
            {EVENT_TYPES[event.type].label}
          </span>
          {event.purpose && (
            <span className="rounded-full border border-sage/30 px-2 py-0.5 text-[10px] font-bold text-sage">
              {EVENT_PURPOSES[event.purpose].label}
            </span>
          )}
        </div>
        <h3 className="font-serif text-base font-bold leading-snug">{event.title}</h3>
        <p className="m-0 text-[13px] text-charcoal/60">{event.dateLabel}</p>
        <div className="mt-auto pt-2 text-[13px] font-bold text-sage">Free to attend</div>
      </div>
    </Link>
  );
}
