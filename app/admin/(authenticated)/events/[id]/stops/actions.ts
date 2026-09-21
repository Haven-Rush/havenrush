"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { STOP_KINDS, type StopKind } from "@/lib/event-types";

export type StopFormState = { error?: string; ok?: boolean } | null;

type ParsedStop = {
  eventId: string;
  order: number;
  kind: StopKind;
  name: string;
  address: string;
  agentId: string | null;
};

function parseStopForm(
  eventId: string,
  formData: FormData,
): { data: ParsedStop } | { error: string } {
  const order = Number(formData.get("order"));
  const kind = String(formData.get("kind") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const agentId = String(formData.get("agentId") ?? "").trim() || null;

  if (!Number.isFinite(order) || order <= 0) {
    return { error: "Order must be a positive number." };
  }
  if (!(kind in STOP_KINDS)) {
    return { error: "Invalid stop kind." };
  }
  if (!name || !address) {
    return { error: "Name and address are required." };
  }
  if (kind === "LISTING" && !agentId) {
    return { error: "Listing stops need an agent." };
  }

  return { data: { eventId, order, kind: kind as StopKind, name, address, agentId } };
}

function revalidateStopsPaths(eventId: string, slug?: string) {
  revalidatePath(`/admin/events/${eventId}/stops`);
  revalidatePath(`/admin/events/${eventId}/edit`);
  if (slug) revalidatePath(`/events/${slug}`);
}

async function getEventSlug(eventId: string): Promise<string | undefined> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  return event?.slug;
}

export async function createStop(
  eventId: string,
  _prevState: StopFormState,
  formData: FormData,
): Promise<StopFormState> {
  const parsed = parseStopForm(eventId, formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.stop.create({
    data: { ...parsed.data, scanToken: randomUUID() },
  });

  revalidateStopsPaths(eventId, await getEventSlug(eventId));
  return { ok: true };
}

export async function updateStop(
  eventId: string,
  stopId: string,
  _prevState: StopFormState,
  formData: FormData,
): Promise<StopFormState> {
  const parsed = parseStopForm(eventId, formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.stop.update({ where: { id: stopId }, data: parsed.data });

  revalidateStopsPaths(eventId, await getEventSlug(eventId));
  return { ok: true };
}

export async function deleteStop(eventId: string, stopId: string): Promise<void> {
  await prisma.stop.delete({ where: { id: stopId } });
  revalidateStopsPaths(eventId, await getEventSlug(eventId));
}

export async function moveStop(
  eventId: string,
  stopId: string,
  direction: "up" | "down",
): Promise<void> {
  const stops = await prisma.stop.findMany({
    where: { eventId },
    orderBy: { order: "asc" },
  });
  const index = stops.findIndex((stop) => stop.id === stopId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= stops.length) return;

  const current = stops[index];
  const swapWith = stops[swapIndex];

  await prisma.$transaction([
    prisma.stop.update({ where: { id: current.id }, data: { order: swapWith.order } }),
    prisma.stop.update({ where: { id: swapWith.id }, data: { order: current.order } }),
  ]);

  revalidateStopsPaths(eventId, await getEventSlug(eventId));
}
