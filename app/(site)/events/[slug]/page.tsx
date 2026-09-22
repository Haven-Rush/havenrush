import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENT_PURPOSES, EVENT_TYPES } from "@/lib/event-types";
import {
  getEventDetailBySlug,
  homesCount,
  hostingBrokerages,
  tastingStopsCount,
  topReward,
} from "@/lib/events-db";
import { RsvpFlow } from "@/components/rsvp-flow";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventDetailBySlug(slug);
  if (!event) notFound();

  const brokerages = hostingBrokerages(event);

  return (
    <section className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
      <Link
        href="/events"
        className="mb-6 inline-block text-[13px] font-semibold text-sage no-underline"
      >
        ← Back to events
      </Link>

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
          {EVENT_TYPES[event.type].label}
        </span>
        <span className="rounded-full border border-sage/30 px-2.5 py-0.5 text-[11px] font-bold text-sage">
          {EVENT_PURPOSES[event.purpose].label}
        </span>
      </div>
      <h1 className="mb-2 font-serif text-[clamp(26px,3.8vw,36px)] font-bold">{event.title}</h1>
      <p className="mb-2 text-sm text-charcoal/55">
        {event.neighborhood} · {event.city}
      </p>
      {brokerages.length > 0 && (
        <p className="mb-7 text-[13px] text-charcoal/60">
          Hosted with{" "}
          {brokerages.map((name, i) => (
            <span key={name} className="font-semibold text-charcoal/80">
              {name}
              {i < brokerages.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}

      <p className="mb-7 text-[15px] leading-relaxed text-charcoal/75">{event.description}</p>

      <div className="mb-7 grid grid-cols-3 gap-4 border-y border-charcoal/10 py-[22px] text-center">
        <Stat label="Homes" value={String(homesCount(event))} />
        <Stat label="Food & Coffee Stops" value={String(tastingStopsCount(event))} />
        <Stat label="Reward" value={topReward(event) ?? "—"} accent />
      </div>

      <RsvpFlow eventSlug={event.slug} />
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-charcoal/50">{label}</div>
      <div className={`text-[15px] font-bold ${accent ? "text-honey" : "text-sage"}`}>
        {value}
      </div>
    </div>
  );
}
