import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { HostStatus } from "@prisma/client";

export function createHostApplication(data: {
  name: string;
  email: string;
  password: string;
  placeName: string;
  about: string;
}) {
  return prisma.host.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: hashPassword(data.password),
      placeName: data.placeName,
      about: data.about,
    },
  });
}

/** Verifies email + password only -- status is checked by the caller/page, not here. */
export async function verifyHostCredentials(email: string, password: string) {
  const host = await prisma.host.findUnique({ where: { email: email.toLowerCase() } });
  if (!host || !verifyPassword(password, host.passwordHash)) return null;
  return host;
}

export function getHostById(id: string) {
  return prisma.host.findUnique({ where: { id } });
}

export function listHostApplications() {
  return prisma.host.findMany({ orderBy: { appliedAt: "desc" } });
}

export function reviewHostApplication(
  id: string,
  status: Extract<HostStatus, "APPROVED" | "REJECTED">,
  reviewNote: string | null,
) {
  return prisma.host.update({
    where: { id },
    data: { status, reviewedAt: new Date(), reviewNote },
  });
}

export function setHostStripeAccountId(id: string, stripeAccountId: string) {
  return prisma.host.update({
    where: { id },
    data: { stripeAccountId },
  });
}

/** Synced from Stripe (either the account.updated webhook, once built, or a
 * direct accounts.retrieve() call right after onboarding returns). */
export function setHostStripeCapabilities(
  id: string,
  capabilities: { chargesEnabled: boolean; payoutsEnabled: boolean },
) {
  return prisma.host.update({
    where: { id },
    data: {
      stripeChargesEnabled: capabilities.chargesEnabled,
      stripePayoutsEnabled: capabilities.payoutsEnabled,
    },
  });
}
