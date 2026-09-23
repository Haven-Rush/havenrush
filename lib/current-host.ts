import { cookies } from "next/headers";
import type { Host } from "@prisma/client";
import { getHostIdFromSessionCookieValue, HOST_SESSION_COOKIE } from "@/lib/host-auth";
import { getHostById } from "@/lib/hosts-db";

/**
 * The signed-in host for the current request, or null. Assumes proxy.ts
 * has already gated the route (it redirects to /host/login on an invalid
 * session before any page/action using this runs).
 */
export async function getCurrentHost(): Promise<Host | null> {
  const cookieStore = await cookies();
  const hostId = getHostIdFromSessionCookieValue(cookieStore.get(HOST_SESSION_COOKIE)?.value);
  return hostId ? await getHostById(hostId) : null;
}
