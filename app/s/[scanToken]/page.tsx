import { countStopsForEvent, getStopByScanToken, isEventLive } from "@/lib/scan-db";
import { ScanBadge, ScanShell } from "@/components/scan-shell";
import { ScanCheckIn } from "@/components/scan-checkin";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ scanToken: string }>;
}) {
  const { scanToken } = await params;
  const stop = await getStopByScanToken(scanToken);

  if (!stop) {
    return (
      <ScanShell>
        <ScanBadge tone="neutral">!</ScanBadge>
        <h1 className="mb-2 font-serif text-xl font-bold">Code not recognized</h1>
        <p className="text-sm text-charcoal/70">
          This QR code doesn&apos;t match a stop we know about. Double-check you scanned the right
          sign, or ask the host for help.
        </p>
      </ScanShell>
    );
  }

  if (!isEventLive(stop.event)) {
    return (
      <ScanShell>
        <ScanBadge tone="neutral">!</ScanBadge>
        <h1 className="mb-2 font-serif text-xl font-bold">Not live right now</h1>
        <p className="text-sm text-charcoal/70">
          <span className="font-semibold">{stop.event.title}</span> isn&apos;t happening at the
          moment. Check-in only works while the event is live.
        </p>
      </ScanShell>
    );
  }

  const totalStops = await countStopsForEvent(stop.event.id);

  return (
    <ScanCheckIn
      stopName={stop.name}
      stopKind={stop.kind}
      eventId={stop.event.id}
      eventTitle={stop.event.title}
      totalStops={totalStops}
    />
  );
}
