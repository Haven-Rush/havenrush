import { FAIR_MARKET_VALUE_DISCLAIMER } from "@/lib/site-config";
import { AgentInquiryForm } from "@/components/agent-inquiry-form";

const PACKAGES = [
  {
    type: "Gather",
    bullets: ["One property. Coffee or live music sponsor.", "Leads go straight to your CRM."],
  },
  {
    type: "Hunt",
    bullets: [
      "Featured stop on a multi-property hunt.",
      "Passport placement and signage included.",
    ],
  },
  {
    type: "Explore",
    bullets: [
      "Featured stop on a citywide passport.",
      "Signage included. Leads go to your CRM, with consent.",
    ],
  },
  {
    type: "Market",
    bullets: [
      "Feature your model homes in a builder-hosted market.",
      "Leads go straight to your CRM, with consent.",
    ],
  },
  {
    type: "Coworking, Hotels & Venues",
    bullets: [
      "Host a Gather or Hunt on your own space — no listing required.",
      "Same crowd, coffee, and stamped passport. Leads go straight to your CRM, with consent.",
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
          Turn your place into an experience people show up for.
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-charcoal/65">
          We bring the crowd, local coffee, and music. You meet people who actually want to be
          there.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 pb-10 sm:grid-cols-2 sm:px-8">
        {PACKAGES.map((pkg) => (
          <div key={pkg.type} className="rounded-[20px] border border-charcoal/8 bg-white p-7">
            <h3 className="mb-3.5 font-serif text-lg font-bold text-sage">{pkg.type}</h3>
            <div className="mb-5 flex flex-col gap-2.5 text-[13px] text-charcoal/65">
              {pkg.bullets.map((bullet) => (
                <div key={bullet}>{bullet}</div>
              ))}
            </div>
            <AgentInquiryForm packageInterest={pkg.type} />
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
