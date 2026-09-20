import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENT_TYPES } from "@/lib/event-types";
import {
  EVENTS,
  getEventBySlug,
  homesCount,
  hostingBrokerages,
  tastingStopsCount,
  topReward,
} from "@/lib/seed-data";
import { RsvpFlow } from "@/components/rsvp-flow";

export function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
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

      <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
        {EVENT_TYPES[event.type].label}
      </div>
      <h1 className="mb-2 font-serif text-[clamp(26px,3.8vw,36px)] font-bold">{event.title}</h1>
      <p className="mb-2 text-sm text-charcoal/55">
        {event.neighborhood} · {event.city}, {event.state}
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

      <RsvpFlow demoPassportToken="demo-pass-a1b2c3d4" />
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
