"use server";

import { revalidatePath } from "next/cache";
import { reviewHostApplication } from "@/lib/hosts-db";

export async function approveHost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return;
  await reviewHostApplication(id, "APPROVED", note || null);
  revalidatePath("/admin/hosts");
}

export async function rejectHost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return;
  await reviewHostApplication(id, "REJECTED", note || null);
  revalidatePath("/admin/hosts");
}
