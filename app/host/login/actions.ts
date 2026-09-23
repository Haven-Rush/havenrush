"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHostSessionCookieValue, HOST_SESSION_COOKIE } from "@/lib/host-auth";
import { verifyHostCredentials } from "@/lib/hosts-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/request-ip";

const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export async function login(formData: FormData) {
  const ip = getClientIpFromHeaders(await headers());
  const { allowed } = checkRateLimit(`host-login:${ip}`, RATE_LIMIT);
  if (!allowed) {
    redirect("/host/login?error=1");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const host = email && password ? await verifyHostCredentials(email, password) : null;
  if (!host) {
    redirect("/host/login?error=1");
  }

  // Login succeeds regardless of application status -- a pending or
  // rejected host can still sign in to see their status. /host itself
  // gates what a non-APPROVED host can actually do.
  const cookieStore = await cookies();
  cookieStore.set(HOST_SESSION_COOKIE, createHostSessionCookieValue(host.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/host");
}
