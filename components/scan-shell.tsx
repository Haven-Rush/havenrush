/**
 * Shared layout for every /s/[scanToken] state (server-rendered errors and
 * the client check-in flow alike) — mobile-first, matches the passport
 * page's card language.
 */
export function ScanShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-linen px-6 py-12 text-center text-charcoal">
      {children}
    </div>
  );
}

export function ScanBadge({
  tone,
  children,
}: {
  tone: "success" | "neutral";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold ${
        tone === "success" ? "bg-honey text-charcoal" : "bg-charcoal/10 text-charcoal/50"
      }`}
    >
      {children}
    </div>
  );
}
