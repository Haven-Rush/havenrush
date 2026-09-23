import { listHostApplications } from "@/lib/hosts-db";
import { approveHost, rejectHost } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Host Applications | Haven Rush Admin",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

const STATUS_CLASSES = {
  PENDING: "bg-honey/15 text-honey-text",
  APPROVED: "bg-sage/10 text-sage",
  REJECTED: "bg-red-100 text-red-700",
} as const;

export default async function AdminHostsPage() {
  const hosts = await listHostApplications();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold">Host applications</h1>

      <div className="flex flex-col gap-4">
        {hosts.map((host) => (
          <div key={host.id} className="rounded-xl border border-charcoal/10 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-charcoal">
                  {host.name} · {host.placeName}
                </div>
                <div className="text-[13px] text-charcoal/55">{host.email}</div>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${STATUS_CLASSES[host.status]}`}
              >
                {STATUS_LABEL[host.status]}
              </span>
            </div>

            <p className="mb-4 text-[13px] leading-relaxed text-charcoal/70">{host.about}</p>

            {host.status === "PENDING" ? (
              <form action={approveHost} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={host.id} />
                <input
                  name="note"
                  placeholder="Note (optional)"
                  className="min-w-[180px] flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-[13px] outline-none focus:border-sage"
                />
                <button
                  type="submit"
                  formAction={approveHost}
                  className="rounded-full bg-sage px-4 py-2 text-[13px] font-bold text-linen hover:bg-sage-dark"
                >
                  Approve
                </button>
                <button
                  type="submit"
                  formAction={rejectHost}
                  className="rounded-full border border-charcoal/15 px-4 py-2 text-[13px] font-bold text-charcoal/70 hover:border-charcoal/30"
                >
                  Reject
                </button>
              </form>
            ) : (
              <p className="text-[12px] text-charcoal/50">
                {host.reviewNote ? `Note: ${host.reviewNote}` : "No note."}
              </p>
            )}
          </div>
        ))}

        {hosts.length === 0 && (
          <p className="rounded-xl border border-charcoal/10 bg-white px-4 py-8 text-center text-charcoal/50">
            No host applications yet.
          </p>
        )}
      </div>
    </div>
  );
}
