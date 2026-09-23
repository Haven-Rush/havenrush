"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HOST_SESSION_COOKIE } from "@/lib/host-auth";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(HOST_SESSION_COOKIE);
  redirect("/host/login");
}
