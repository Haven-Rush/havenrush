import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const INTENT_LABELS: Record<string, string> = {
  EXPLORING: "Just exploring",
  BUYING: "Buying",
  RENTING: "Renting",
};

const TIMELINE_LABELS: Record<string, string> = {
  JUST_LOOKING: "Just looking",
  MOVING_SOON: "Moving soon",
};

export default async function EventRsvpsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!event) notFound();

  const passes = await prisma.pass.findMany({
    where: { eventId: id },
    include: { attendee: true, _count: { select: { stamps: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="mb-1 block text-[13px] font-semibold text-sage no-underline"
        >
          ← {event.title}
        </Link>
        <h1 className="font-serif text-2xl font-bold">RSVPs</h1>
        <p className="mt-1 text-[13px] text-charcoal/60">
          {passes.length} {passes.length === 1 ? "RSVP" : "RSVPs"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-charcoal/10 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-charcoal/10 text-[11px] uppercase tracking-wide text-charcoal/50">
              <th className="px-4 py-3 font-bold">Email</th>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Interest</th>
              <th className="px-4 py-3 font-bold">Timeline</th>
              <th className="px-4 py-3 font-bold">Consent</th>
              <th className="px-4 py-3 font-bold">Stamps</th>
            </tr>
          </thead>
          <tbody>
            {passes.map((pass) => (
              <tr key={pass.id} className="border-b border-charcoal/8 last:border-0">
                <td className="px-4 py-3 font-semibold">{pass.attendee.email}</td>
                <td className="px-4 py-3 text-charcoal/70">{pass.attendee.name ?? "—"}</td>
                <td className="px-4 py-3 text-charcoal/70">
                  {INTENT_LABELS[pass.intent] ?? pass.intent}
                </td>
                <td className="px-4 py-3 text-charcoal/70">
                  {TIMELINE_LABELS[pass.timeline] ?? pass.timeline}
                </td>
                <td className="px-4 py-3">
                  {pass.agentContactConsent ? (
                    <span className="rounded-md bg-sage/10 px-2 py-1 text-[11px] font-bold text-sage">
                      Yes
                      {pass.consentedAt
                        ? ` · ${pass.consentedAt.toLocaleDateString("en-US")}`
                        : ""}
                    </span>
                  ) : (
                    <span className="rounded-md bg-charcoal/5 px-2 py-1 text-[11px] font-bold text-charcoal/50">
                      No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-charcoal/70">{pass._count.stamps}</td>
              </tr>
            ))}
            {passes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-charcoal/50">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
