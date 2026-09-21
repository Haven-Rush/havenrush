"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STOP_KINDS, type StopKind } from "@/lib/event-types";
import { getStoredPassToken, storePassToken } from "@/lib/pass-storage";
import { ScanBadge, ScanShell } from "@/components/scan-shell";

type State =
  | { status: "checking" }
  // No pass token stored for this event on this device — shows the
  // email-lookup fallback form.
  | { status: "no-local-pass" }
  | { status: "wrong-event" }
  | { status: "error"; message: string }
  | { status: "stamped"; alreadyStamped: boolean; stampedCount: number; passToken: string };

/** Calls the scan endpoint and maps its response onto our state shape — shared by the auto-check effect and the email-lookup fallback, so both "complete the stamp the same way." */
async function stampWithToken(passToken: string, scanToken: string): Promise<State> {
  try {
    const res = await fetch("/api/stamps/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passToken, scanToken }),
    });
    const data = await res.json();

    if (res.ok) {
      return {
        status: "stamped",
        alreadyStamped: Boolean(data.alreadyStamped),
        stampedCount: data.stampedCount,
        passToken,
      };
    }

    if (res.status === 400 && typeof data.error === "string" && data.error.includes("doesn't belong")) {
      return { status: "wrong-event" };
    }

    if (res.status === 404) {
      // The token (local or just-looked-up) points at a pass that no
      // longer exists.
      return { status: "no-local-pass" };
    }

    return {
      status: "error",
      message: typeof data.error === "string" ? data.error : "Something went wrong. Please try again.",
    };
  } catch {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}

export function ScanCheckIn({
  stopName,
  stopKind,
  eventSlug,
  eventTitle,
  totalStops,
}: {
  stopName: string;
  stopKind: StopKind;
  eventSlug: string;
  eventTitle: string;
  totalStops: number;
}) {
  // The scanToken is read from the URL itself (the page is already at
  // /s/[scanToken]) rather than being handed down as a prop from the
  // server — it's never routed through any data-passing layer beyond the
  // URL the attendee is already on.
  const params = useParams<{ scanToken: string }>();
  const [state, setState] = useState<State>({ status: "checking" });

  const [email, setEmail] = useState("");
  const [lookupSubmitting, setLookupSubmitting] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const passToken = getStoredPassToken(eventSlug);
      if (!passToken) {
        if (!cancelled) setState({ status: "no-local-pass" });
        return;
      }

      const result = await stampWithToken(passToken, params.scanToken);
      if (!cancelled) setState(result);
    })();

    return () => {
      cancelled = true;
    };
    // params.scanToken is stable for the life of this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug]);

  async function handleEmailLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setLookupSubmitting(true);
    try {
      const res = await fetch("/api/passport/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLookupError(
          typeof data.error === "string" ? data.error : "Something went wrong. Please try again.",
        );
        return;
      }

      // Save it so the next scan at this event doesn't need the form again.
      storePassToken(eventSlug, data.token);
      setState(await stampWithToken(data.token, params.scanToken));
    } catch {
      setLookupError("Something went wrong. Please try again.");
    } finally {
      setLookupSubmitting(false);
    }
  }

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
        <h1 className="mb-2 font-serif text-xl font-bold">Find your pass</h1>
        <p className="mb-5 text-sm text-charcoal/70">
          We don&apos;t see a pass for <span className="font-semibold">{eventTitle}</span> on this
          device. Enter the email you RSVP&apos;d with.
        </p>
        <form onSubmit={handleEmailLookup} className="w-full max-w-xs">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-3 w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-3 text-center text-sm text-charcoal outline-none focus:border-sage"
          />
          {lookupError && (
            <p className="mb-3 text-[13px] font-semibold text-red-700">{lookupError}</p>
          )}
          <button
            type="submit"
            disabled={lookupSubmitting || !email.trim()}
            className="w-full rounded-full bg-sage px-6 py-3.5 text-sm font-bold text-linen hover:bg-sage-dark disabled:opacity-50"
          >
            {lookupSubmitting ? "Looking up…" : "Find my pass"}
          </button>
        </form>
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
