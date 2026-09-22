"use client";

import { useActionState, useState } from "react";
import { EVENT_PURPOSE_ORDER, EVENT_PURPOSES, EVENT_TYPE_ORDER, EVENT_TYPES } from "@/lib/event-types";
import { slugify } from "@/lib/slugify";
import type { EventFormState } from "@/app/admin/(authenticated)/events/actions";

export type RewardTierInput = { stops: string; reward: string };

export type EventFormDefaultValues = {
  title: string;
  slug: string;
  type: string;
  purpose: string;
  neighborhood: string;
  city: string;
  startsAt: string; // datetime-local value
  endsAt: string; // datetime-local value
  description: string;
  rewardTiers: RewardTierInput[];
};

const EMPTY_TIER: RewardTierInput = { stops: "", reward: "" };

export function EventForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>;
  submitLabel: string;
  defaultValues?: EventFormDefaultValues;
}) {
  const [state, formAction, pending] = useActionState<EventFormState, FormData>(action, null);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [tiers, setTiers] = useState<RewardTierInput[]>(
    defaultValues?.rewardTiers?.length ? defaultValues.rewardTiers : [EMPTY_TIER],
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateTier(index: number, patch: Partial<RewardTierInput>) {
    setTiers((prev) => prev.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function removeTier(index: number) {
    setTiers((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <input
        type="hidden"
        name="rewardTiers"
        value={JSON.stringify(
          tiers.map((tier) => ({ stops: Number(tier.stops), reward: tier.reward })),
        )}
      />

      <Field label="Title">
        <input
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" hint="Used in the event's URL. Auto-fills from the title until edited.">
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Type">
        <select
          name="type"
          required
          defaultValue={defaultValues?.type ?? EVENT_TYPE_ORDER[0]}
          className={inputClass}
        >
          {EVENT_TYPE_ORDER.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPES[type].label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Real estate purpose"
        hint="Optional — what this event is marketing the property for, if it's real-estate-related"
      >
        <select
          name="purpose"
          defaultValue={defaultValues?.purpose ?? ""}
          className={inputClass}
        >
          <option value="">Not specified</option>
          {EVENT_PURPOSE_ORDER.map((purpose) => (
            <option key={purpose} value={purpose}>
              {EVENT_PURPOSES[purpose].label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Neighborhood">
          <input
            name="neighborhood"
            required
            defaultValue={defaultValues?.neighborhood}
            className={inputClass}
          />
        </Field>
        <Field label="City">
          <input name="city" required defaultValue={defaultValues?.city} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Starts at" hint="America/Chicago">
          <input
            type="datetime-local"
            name="startsAt"
            required
            defaultValue={defaultValues?.startsAt}
            className={inputClass}
          />
        </Field>
        <Field label="Ends at" hint="America/Chicago">
          <input
            type="datetime-local"
            name="endsAt"
            required
            defaultValue={defaultValues?.endsAt}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </Field>

      <div>
        <div className="mb-2 text-xs font-bold text-charcoal/60">Reward tiers</div>
        <div className="flex flex-col gap-2">
          {tiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder="Stops"
                value={tier.stops}
                onChange={(e) => updateTier(index, { stops: e.target.value })}
                className={`w-24 ${fieldBaseClass}`}
              />
              <input
                type="text"
                placeholder="Reward, e.g. Free coffee"
                value={tier.reward}
                onChange={(e) => updateTier(index, { reward: e.target.value })}
                className={`flex-1 ${fieldBaseClass}`}
              />
              <button
                type="button"
                onClick={() => removeTier(index)}
                disabled={tiers.length === 1}
                className="rounded-lg border border-charcoal/15 px-2.5 py-2 text-xs font-bold text-charcoal/60 hover:border-charcoal/30 disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTiers((prev) => [...prev, EMPTY_TIER])}
          className="mt-2 text-[13px] font-bold text-sage hover:underline"
        >
          + Add tier
        </button>
      </div>

      {state?.error && <p className="text-[13px] font-semibold text-red-700">{state.error}</p>}
      {state?.success && <p className="text-[13px] font-semibold text-sage">Saved.</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen hover:bg-sage-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

// Deliberately excludes width: two reward-tier fields need a narrower/
// flex-fill width instead of the full-width default. Mixing `w-full` into
// this base and appending e.g. `w-24` on top doesn't reliably win — same-
// specificity utility classes are resolved by stylesheet order, not by
// their order in the className string, so `w-full` can beat a narrower
// class appended after it. Each field adds its own width below instead.
const fieldBaseClass =
  "rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage";
const inputClass = `w-full ${fieldBaseClass}`;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-xs font-bold text-charcoal/60">
        {label}
        {hint && <span className="text-[11px] font-normal text-charcoal/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
