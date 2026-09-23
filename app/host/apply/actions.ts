"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createHostApplication } from "@/lib/hosts-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/request-ip";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function applyAsHost(formData: FormData) {
  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = checkRateLimit(`host-apply:${ip}`, RATE_LIMIT);
  if (!allowed) {
    redirect("/host/apply?error=1");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const placeName = String(formData.get("place") ?? "").trim();
  const about = String(formData.get("description") ?? "").trim();

  if (
    !name ||
    !email ||
    !EMAIL_RE.test(email) ||
    password.length < 8 ||
    !placeName ||
    !about
  ) {
    redirect("/host/apply?error=1");
  }

  try {
    await createHostApplication({ name, email, password, placeName, about });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      redirect("/host/apply?error=duplicate");
    }
    throw err;
  }

  redirect("/host/apply?success=1");
}
