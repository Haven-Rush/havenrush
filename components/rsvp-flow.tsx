"use client";

import Link from "next/link";
import { useState } from "react";
import { CONSENT_TEXT } from "@/lib/site-config";
import { storePassToken } from "@/lib/pass-storage";

type Timeline = "JUST_LOOKING" | "MOVING_SOON";
type Intent = "EXPLORING" | "BUYING" | "RENTING";

const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "JUST_LOOKING", label: "Just looking" },
  { value: "MOVING_SOON", label: "Moving soon" },
];

const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: "EXPLORING", label: "Just exploring" },
  { value: "BUYING", label: "Buying" },
  { value: "RENTING", label: "Renting" },
];

export function RsvpFlow({
  eventSlug,
  priceCents = 0,
}: {
  eventSlug: string;
  priceCents?: number;
}) {
  const isPaid = priceCents > 0;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [timeline, setTimeline] = useState<Timeline>("JUST_LOOKING");
  const [intent, setIntent] = useState<Intent>("EXPLORING");
  const [agentContactConsent, setAgentContactConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passToken, setPassToken] = useState<string | null>(null);

  if (step === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-charcoal/8 bg-linen p-6">
        <div className="font-serif text-[22px] font-bold">
          {isPaid ? `$${(priceCents / 100).toFixed(2)}` : "$0 Free Pass"}
        </div>
        <button
          onClick={() => setStep(1)}
          className="rounded-full bg-sage px-7 py-[13px] text-sm font-bold text-linen hover:bg-sage-dark"
        >
          {isPaid ? "Pay & Book" : "Get Pass"}
        </button>
      </div>
    );
  }

  if (step === 1) {
    const canSubmit = email.trim().length > 0 && !submitting;

    const handleSubmit = async () => {
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch(isPaid ? "/api/checkout" : "/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventSlug,
            email: email.trim(),
            name: name.trim() || undefined,
            intent,
            timeline,
            agentContactConsent,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Something went wrong. Please try again.");
        }
        if (isPaid) {
          // Full navigation to Stripe's hosted checkout -- there's no pass
          // yet to store a token for. The webhook creates the Pass once
          // payment actually completes; this tab picks back up on
          // success_url (see app/api/checkout/route.ts).
          window.location.href = data.checkoutUrl;
          return;
        }
        // Persist immediately — don't wait for a passport-page visit that
        // might never happen (e.g. they close this tab from the "You're
        // in" screen without clicking through).
        storePassToken(eventSlug, data.token);
        setPassToken(data.token);
        setStep(2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="rounded-2xl border border-sage/20 bg-linen p-6">
        <h3 className="mb-[18px] font-serif text-[17px] font-bold">Quick preferences</h3>

        <div className="mb-[18px]">
          <label className="mb-2 block text-xs font-bold text-charcoal/60" htmlFor="rsvp-email">
            Email
          </label>
          <input
            id="rsvp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
          />
        </div>

        <div className="mb-[18px]">
          <label className="mb-2 block text-xs font-bold text-charcoal/60" htmlFor="rsvp-name">
            Name (optional)
          </label>
          <input
            id="rsvp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Rivera"
            className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
          />
        </div>

        <PillGroup
          label="Timeline"
          options={TIMELINE_OPTIONS}
          value={timeline}
          onChange={setTimeline}
          marginClass="mb-[18px]"
        />
        <PillGroup
          label="What brings you?"
          options={INTENT_OPTIONS}
          value={intent}
          onChange={setIntent}
          marginClass="mb-[18px]"
        />

        <label className="mb-[22px] flex items-start gap-2.5 text-[13px] leading-relaxed text-charcoal/70">
          <input
            type="checkbox"
            checked={agentContactConsent}
            onChange={(e) => setAgentContactConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0"
          />
          <span>{CONSENT_TEXT}</span>
        </label>

        {error && <p className="mb-4 text-[13px] font-semibold text-red-700">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-sage px-[26px] py-[13px] text-[13px] font-bold text-linen hover:bg-sage-dark disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Continue"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-sage p-7 text-center text-linen">
      <div className="mx-auto mb-[14px] flex h-10 w-10 items-center justify-center rounded-full bg-honey text-lg font-extrabold text-charcoal">
        ✓
      </div>
      <h3 className="mb-[18px] font-serif text-xl font-bold">You&apos;re in.</h3>
      {passToken && (
        <Link
          href={`/passport/${passToken}`}
          className="inline-block rounded-full bg-honey px-6 py-3 text-[13px] font-bold text-charcoal no-underline hover:brightness-95"
        >
          View Mobile Passport
        </Link>
      )}
    </div>
  );
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  marginClass,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  marginClass: string;
}) {
  return (
    <div className={marginClass}>
      <div className="mb-2 text-xs font-bold text-charcoal/60">{label}</div>
      <div className="flex gap-2.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-full px-[18px] py-2.5 text-[13px] font-bold ${
                active
                  ? "bg-sage text-linen"
                  : "border border-charcoal/15 bg-white text-charcoal/80"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
