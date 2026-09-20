import { FAIR_MARKET_VALUE_DISCLAIMER } from "@/lib/site-config";

const PACKAGES = [
  {
    type: "House Party",
    bullets: ["One listing. Coffee or live music sponsor.", "Leads go straight to your CRM."],
  },
  {
    type: "Home Crawl",
    bullets: [
      "Featured stop on a multi-home crawl.",
      "Passport placement and signage included.",
    ],
  },
  {
    type: "Open House Weekend",
    bullets: [
      "Featured listing on a citywide passport.",
      "Signage included. Leads go to your CRM, with consent.",
    ],
  },
] as const;

export const metadata = {
  title: "For Agents & Hosts | Haven Rush",
};

export default function AgentsPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-16 text-center sm:px-8">
        <h1 className="mb-4 font-serif text-[clamp(28px,4.2vw,40px)] font-bold leading-tight text-sage">
          Turn open houses into neighborhood events.
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-charcoal/65">
          We bring the crowd, local coffee, and music. You meet people who actually want to be
          there.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <div key={pkg.type} className="rounded-[20px] border border-charcoal/8 bg-white p-7">
            <h3 className="mb-3.5 font-serif text-lg font-bold text-sage">{pkg.type}</h3>
            <div className="mb-5 flex flex-col gap-2.5 text-[13px] text-charcoal/65">
              {pkg.bullets.map((bullet) => (
                <div key={bullet}>{bullet}</div>
              ))}
            </div>
            <button className="w-full rounded-full bg-sage py-3 text-xs font-bold text-linen hover:bg-sage-dark">
              Request Info
            </button>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16 sm:px-8">
        <p className="rounded-xl border border-charcoal/10 bg-white/60 p-4 text-[11px] leading-relaxed text-charcoal/55">
          {FAIR_MARKET_VALUE_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
