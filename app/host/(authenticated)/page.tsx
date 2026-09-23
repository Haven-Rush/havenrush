import { redirect } from "next/navigation";
import { getCurrentHost } from "@/lib/current-host";
import { connectStripe } from "./stripe/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Host Dashboard | Haven Rush",
};

export default async function HostHomePage({
  searchParams,
}: {
  searchParams: Promise<{ stripeError?: string }>;
}) {
  const host = await getCurrentHost();
  if (!host) {
    redirect("/host/login");
  }
  const { stripeError } = await searchParams;

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
        <>
          <StatusCard tone="approved" title="You're approved!">
            Experience creation is coming soon — this is where you&apos;ll build your first Haven
            Rush event.
          </StatusCard>

          <div className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-6">
            <h2 className="mb-2 font-serif text-lg font-bold">Get paid</h2>
            {host.stripeChargesEnabled && host.stripePayoutsEnabled ? (
              <p className="m-0 text-[14px] font-bold text-sage">Stripe connected ✓</p>
            ) : (
              <>
                <p className="mb-4 text-[14px] leading-relaxed text-charcoal/70">
                  {host.stripeAccountId
                    ? "Your Stripe onboarding isn't finished yet — you'll need it complete before publishing a paid experience. Free experiences don't require this."
                    : "Connect a Stripe account so you can charge for experiences later. Free experiences don't require this."}
                </p>
                {stripeError && (
                  <p className="mb-4 text-[13px] font-semibold text-red-700">
                    We couldn&apos;t reach Stripe just now. Please try again in a moment.
                  </p>
                )}
                <form action={connectStripe}>
                  <button
                    type="submit"
                    className="rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen hover:bg-sage-dark"
                  >
                    {host.stripeAccountId ? "Finish Stripe onboarding" : "Connect with Stripe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </>
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
