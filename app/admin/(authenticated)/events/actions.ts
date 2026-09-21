"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPES, type EventType } from "@/lib/event-types";
import { SLUG_RE } from "@/lib/slugify";
import { fromDateTimeLocalValue } from "@/lib/admin-datetime";

export type EventFormState = { error?: string; success?: boolean } | null;

type ParsedEvent = {
  title: string;
  slug: string;
  type: EventType;
  neighborhood: string;
  city: string;
  startsAt: Date;
  endsAt: Date;
  description: string;
  rewardTiers: { stops: number; reward: string }[];
};

function parseEventForm(formData: FormData): { data: ParsedEvent } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const endsAtRaw = String(formData.get("endsAt") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const rewardTiersRaw = String(formData.get("rewardTiers") ?? "[]");

  if (!title || !slug || !type || !neighborhood || !city || !startsAtRaw || !endsAtRaw || !description) {
    return { error: "All fields are required." };
  }
  if (!SLUG_RE.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!(type in EVENT_TYPES)) {
    return { error: "Invalid event type." };
  }

  const startsAt = fromDateTimeLocalValue(startsAtRaw);
  const endsAt = fromDateTimeLocalValue(endsAtRaw);
  if (!startsAt || !endsAt) {
    return { error: "Invalid start/end date." };
  }
  if (endsAt < startsAt) {
    return { error: "End date must be after the start date." };
  }

  let rewardTiers: { stops: number; reward: string }[];
  try {
    const parsed = JSON.parse(rewardTiersRaw);
    if (!Array.isArray(parsed)) throw new Error();
    rewardTiers = parsed
      .map((tier) => ({
        stops: Number((tier as { stops?: unknown }).stops),
        reward: String((tier as { reward?: unknown }).reward ?? "").trim(),
      }))
      .filter((tier) => Number.isFinite(tier.stops) && tier.stops > 0 && tier.reward.length > 0);
  } catch {
    return { error: "Invalid reward tiers." };
  }
  if (rewardTiers.length === 0) {
    return { error: "Add at least one reward tier." };
  }

  return {
    data: {
      title,
      slug,
      type: type as EventType,
      neighborhood,
      city,
      startsAt,
      endsAt,
      description,
      rewardTiers,
    },
  };
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "That slug is already in use." };
  }

  const event = await prisma.event.create({ data: parsed.data });
  revalidatePath("/admin");
  redirect(`/admin/events/${event.id}/edit`);
}

export async function updateEvent(
  id: string,
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await prisma.event.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.id !== id) {
    return { error: "That slug is already in use." };
  }

  await prisma.event.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${id}/edit`);
  revalidatePath(`/events/${parsed.data.slug}`);
  return { success: true };
}
