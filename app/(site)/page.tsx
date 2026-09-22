import Link from "next/link";
import { EVENT_TYPE_ORDER, EVENT_TYPES } from "@/lib/event-types";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-20 text-center sm:px-8 sm:pt-24">
        <h1 className="mb-6 font-serif text-[clamp(34px,5.2vw,56px)] font-bold leading-[1.14]">
          Walk the neighborhood.
          <br />
          Meet the places.
        </h1>
        <p className="mx-auto mb-9 max-w-md text-lg leading-relaxed text-charcoal/70">
          Explore local spots, sample neighborhood coffee, and listen to live music. No
          pressure. No pushy sales pitch.
        </p>
        <div className="mx-auto flex max-w-lg flex-wrap gap-2 rounded-2xl border border-charcoal/6 bg-white p-2 shadow-[0_12px_30px_rgba(31,36,33,0.08)]">
          <div className="flex min-w-[180px] flex-1 items-center px-3.5 py-2.5">
            <span className="text-sm text-charcoal/45">Enter neighborhood or zip code</span>
          </div>
          <Link
            href="/events"
            className="whitespace-nowrap rounded-[11px] bg-sage px-6 py-3 text-[13px] font-bold text-linen no-underline hover:bg-sage-dark"
          >
            Find a Hunt
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-4 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPE_ORDER.filter((type) => type !== "HOME_FAIR").map((type) => (
            <div key={type} className="rounded-[18px] border border-charcoal/8 bg-white p-7">
              <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
                {EVENT_TYPES[type].label}
              </div>
              <p className="m-0 text-[15px] leading-relaxed text-charcoal/75">
                {EVENT_TYPES[type].tagline}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-charcoal/8 bg-white px-6 py-5">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-honey-text">
            For builders
          </div>
          <div className="text-[13px] font-bold text-charcoal">{EVENT_TYPES.HOME_FAIR.label}</div>
          <p className="m-0 flex-1 text-[13px] leading-relaxed text-charcoal/65">
            {EVENT_TYPES.HOME_FAIR.tagline}
          </p>
        </div>
      </section>

      <section className="bg-sage px-6 py-16 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="mb-2.5 font-serif text-[27px] font-bold leading-tight text-linen">
              Turn your place into a neighborhood event.
            </h2>
            <p className="m-0 text-sm leading-relaxed text-linen/75">
              We bring the crowd, local coffee, and music. You meet people who actually want to
              be there.
            </p>
          </div>
          <Link
            href="/agents"
            className="whitespace-nowrap rounded-full bg-honey px-7 py-3.5 text-sm font-bold text-charcoal no-underline hover:brightness-95"
          >
            Partner With Us
          </Link>
        </div>
      </section>
    </div>
  );
}
