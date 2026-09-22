"use client";

import { useState } from "react";

export function AgentInquiryForm({ packageInterest }: { packageInterest: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="rounded-full bg-sage/10 py-3 text-center text-xs font-bold text-sage">
        Thanks — we&apos;ll be in touch.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-sage py-3 text-xs font-bold text-linen hover:bg-sage-dark"
      >
        Request Info
      </button>
    );
  }

  const canSubmit =
    name.trim() && email.trim() && brokerage.trim() && message.trim() && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/agent-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          brokerage: brokerage.trim(),
          message: message.trim(),
          packageInterest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
      />
      <input
        type="text"
        value={brokerage}
        onChange={(e) => setBrokerage(e.target.value)}
        placeholder="Company or brokerage"
        className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What are you looking for?"
        rows={3}
        className="w-full rounded-xl border border-charcoal/15 bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-sage"
      />
      {error && <p className="text-[12px] font-semibold text-red-700">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-full bg-sage py-3 text-xs font-bold text-linen hover:bg-sage-dark disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
