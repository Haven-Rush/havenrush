"use client";

import { useEffect } from "react";
import { storePassToken } from "@/lib/pass-storage";

/** Renders nothing — just stores the pass token for this event on mount. */
export function PersistPassToken({ eventId, token }: { eventId: string; token: string }) {
  useEffect(() => {
    storePassToken(eventId, token);
  }, [eventId, token]);

  return null;
}
