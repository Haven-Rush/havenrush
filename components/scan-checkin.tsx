"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STOP_KINDS, type StopKind } from "@/lib/event-types";
import { getStoredPassToken } from "@/lib/pass-storage";
import { ScanBadge, ScanShell } from "@/components/scan-shell";

type State =
  | { status: "checking" }
  // No pass token stored for this event on this device. Step 3 replaces
  // this with an email-lookup form; for now it's an honest dead end.
  | { status: "no-local-pass" }
  | { status: "wrong-event" }
  | { status: "error"; message: string }
  | { status: "stamped"; alreadyStamped: boolean; stampedCount: number; passToken: string };

export function ScanCheckIn({
  stopName,
  stopKind,
  eventId,
  eventTitle,
  totalStops,
}: {
  stopName: string;
  stopKind: StopKind;
  eventId: string;
  eventTitle: string;
  totalStops: number;
}) {
  // The scanToken is read from the URL itself (the page is already at
  // /s/[scanToken]) rather than being handed down as a prop from the
  // server — it's never routed through any data-passing layer beyond the
  // URL the attendee is already on.
  const params = useParams<{ scanToken: string }>();
  const [state, setState] = useState<State>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const passToken = getStoredPassToken(eventId);
      if (!passToken) {
        if (!cancelled) setState({ status: "no-local-pass" });
        return;
      }

      try {
        const res = await fetch("/api/stamps/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passToken, scanToken: params.scanToken }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (res.ok) {
          setState({
            status: "stamped",
            alreadyStamped: Boolean(data.alreadyStamped),
            stampedCount: data.stampedCount,
            passToken,
          });
          return;
        }

        if (res.status === 400 && typeof data.error === "string" && data.error.includes("doesn't belong")) {
          setState({ status: "wrong-event" });
          return;
        }

        if (res.status === 404) {
          // The stored token points at a pass that no longer exists.
          setState({ status: "no-local-pass" });
          return;
        }

        setState({
          status: "error",
          message: typeof data.error === "string" ? data.error : "Something went wrong. Please try again.",
        });
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Something went wrong. Please try again." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // params.scanToken is stable for the life of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (state.status === "checking") {
    return (
      <ScanShell>
        <p className="text-sm text-charcoal/50">Checking your pass…</p>
      </ScanShell>
    );
  }

  if (state.status === "no-local-pass") {
    return (
      <ScanShell>
        <ScanBadge tone="neutral">?</ScanBadge>
        <h1 className="mb-2 font-serif text-xl font-bold">We couldn&apos;t find your pass</h1>
        <p className="mb-1 text-sm text-charcoal/70">
          We don&apos;t see a pass for <span className="font-semibold">{eventTitle}</span> on this
          device.
        </p>
        <p className="text-[13px] text-charcoal/45">
          Open your passport link from your RSVP confirmation on this device, then scan again.
        </p>
      </ScanShell>
    );
  }

  if (state.status === "wrong-event") {
    return (
      <ScanShell>
        <ScanBadge tone="neutral">!</ScanBadge>
        <h1 className="mb-2 font-serif text-xl font-bold">Different event</h1>
        <p className="text-sm text-charcoal/70">
          The pass on this device isn&apos;t for <span className="font-semibold">{eventTitle}</span>
          . Make sure you&apos;re signed up for this event, then scan again.
        </p>
      </ScanShell>
    );
  }

  if (state.status === "error") {
    return (
      <ScanShell>
        <ScanBadge tone="neutral">!</ScanBadge>
        <h1 className="mb-2 font-serif text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-charcoal/70">{state.message}</p>
      </ScanShell>
    );
  }

  return (
    <ScanShell>
      <ScanBadge tone="success">✓</ScanBadge>
      <h1 className="mb-2 font-serif text-xl font-bold">
        {state.alreadyStamped ? "Already stamped" : "Stamped!"}
      </h1>
      <p className="mb-1 text-sm text-charcoal/70">
        {stopName} · {STOP_KINDS[stopKind].label}
      </p>
      <p className="mb-6 text-lg font-bold text-sage">
        {state.stampedCount} of {totalStops}
      </p>
      <Link
        href={`/passport/${state.passToken}`}
        className="inline-block rounded-full bg-sage px-7 py-3.5 text-sm font-bold text-linen no-underline hover:bg-sage-dark"
      >
        View Passport
      </Link>
    </ScanShell>
  );
}
