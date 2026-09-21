"use client";

import { useEffect } from "react";
import { storePassToken } from "@/lib/pass-storage";

/** Renders nothing — just stores the pass token for this event on mount. */
export function PersistPassToken({ eventSlug, token }: { eventSlug: string; token: string }) {
  useEffect(() => {
    storePassToken(eventSlug, token);
  }, [eventSlug, token]);

  return null;
}
