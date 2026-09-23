import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getHostIdFromSessionCookieValue, HOST_SESSION_COOKIE } from "@/lib/host-auth";
import { getHostById } from "@/lib/hosts-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Host Dashboard | Haven Rush",
};

export default async function HostHomePage() {
  const cookieStore = await cookies();
  const hostId = getHostIdFromSessionCookieValue(cookieStore.get(HOST_SESSION_COOKIE)?.value);
  const host = hostId ? await getHostById(hostId) : null;
  if (!host) {
    redirect("/host/login");
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold">{host.placeName}</h1>
      <p className="mb-8 text-[13px] text-charcoal/55">{host.email}</p>

      {host.status === "PENDING" && (
        <StatusCard tone="pending" title="Application under review">
          We&apos;re still reviewing your application. We&apos;ll email you at {host.email} once a
          decision&apos;s been made.
        </StatusCard>
      )}
      {host.status === "REJECTED" && (
        <StatusCard tone="rejected" title="Application not approved">
          {host.reviewNote || "Your application wasn't approved this time."}
        </StatusCard>
      )}
      {host.status === "APPROVED" && (
        <StatusCard tone="approved" title="You're approved!">
          Experience creation is coming soon — this is where you&apos;ll build your first Haven
          Rush event.
        </StatusCard>
      )}
    </div>
  );
}

function StatusCard({
  tone,
  title,
  children,
}: {
  tone: "pending" | "rejected" | "approved";
  title: string;
  children: React.ReactNode;
}) {
  const toneClasses = {
    pending: "border-honey/40 bg-honey/10",
    rejected: "border-red-200 bg-red-50",
    approved: "border-sage/30 bg-sage/5",
  }[tone];

  return (
    <div className={`rounded-2xl border p-6 ${toneClasses}`}>
      <h2 className="mb-2 font-serif text-lg font-bold">{title}</h2>
      <p className="m-0 text-[14px] leading-relaxed text-charcoal/75">{children}</p>
    </div>
  );
}
