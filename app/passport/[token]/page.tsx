import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, getPassByToken } from "@/lib/seed-data";
import { STOP_KINDS } from "@/lib/event-types";

export default async function PassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pass = getPassByToken(token);
  if (!pass) notFound();

  const event = getEventBySlug(pass.eventSlug);
  if (!event) notFound();

  const stampedCount = pass.stampedStopIds.length;
  const sortedTiers = [...event.rewardTiers].sort((a, b) => a.stops - b.stops);
  const nextTier = sortedTiers.find((tier) => tier.stops > stampedCount);
  const currentReward = [...sortedTiers].reverse().find((tier) => tier.stops <= stampedCount);
  const progressPct = nextTier
    ? Math.min(100, Math.round((stampedCount / nextTier.stops) * 100))
    : 100;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-linen pb-24 text-charcoal">
      <div className="mb-2 px-4 pt-6 text-center">
        <Link href="/" className="text-[11px] font-semibold text-sage no-underline">
          ← Haven Rush
        </Link>
      </div>

      <div className="rounded-b-[28px] bg-sage px-5 pb-[22px] pt-5 text-linen">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-honey">
              Your Pass
            </div>
            <div className="font-serif text-[19px] font-bold">{event.title}</div>
          </div>
          <div className="whitespace-nowrap rounded-full bg-honey px-3 py-1.5 text-[11px] font-extrabold text-charcoal">
            {stampedCount} Stamped
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/15 px-3.5 py-3">
          <div>
            <div className="text-xs font-bold">
              {currentReward ? currentReward.reward : "First reward"}
            </div>
            <div className="mt-0.5 text-[11px] text-linen/70">
              {nextTier
                ? `${nextTier.stops - stampedCount} more stop${
                    nextTier.stops - stampedCount === 1 ? "" : "s"
                  } to go`
                : "All rewards unlocked"}
            </div>
          </div>
          <div className="h-2 w-16 flex-shrink-0 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-honey" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3.5 font-serif text-base font-bold">Your stops</div>
        <div className="flex flex-col gap-2.5">
          {event.stops.map((stop) => {
            const stamped = pass.stampedStopIds.includes(stop.id);
            return (
              <div
                key={stop.id}
                className={`flex items-center justify-between rounded-2xl bg-white p-3.5 ${
                  stamped ? "border border-charcoal/8" : "border-2 border-honey"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      stamped ? "bg-sage text-honey" : "bg-honey/20 text-charcoal"
                    }`}
                  >
                    {stamped ? "✓" : String(stop.order).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">{stop.name}</div>
                    <div className="text-[11px] text-charcoal/55">
                      {STOP_KINDS[stop.kind].label}
                      {stamped ? " · stamped" : ""}
                    </div>
                  </div>
                </div>
                {stamped ? (
                  <span className="rounded-lg bg-sage/10 px-2.5 py-1.5 text-[11px] font-bold text-sage">
                    Stamped
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-lg bg-sage px-3 py-[7px] text-[11px] font-bold text-linen">
                    Scan QR
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-charcoal/10 bg-white px-6 py-3.5">
        <div className="flex flex-col items-center gap-1 text-[10px] font-bold text-sage">
          <div className="h-2 w-2 rounded-full bg-sage" />
          <span>Map</span>
        </div>
        <div className="-mt-7 flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-linen bg-sage text-[11px] font-extrabold text-honey">
          QR
        </div>
        <div className="flex flex-col items-center gap-1 text-[10px] font-bold text-charcoal/40">
          <div className="h-2 w-2 rounded-full bg-charcoal/30" />
          <span>Rewards</span>
        </div>
      </div>
    </div>
  );
}
