import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentHost } from "@/lib/current-host";
import { getStripeClient } from "@/lib/stripe";
import { setHostStripeCapabilities } from "@/lib/hosts-db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stripe Connect | Haven Rush",
};

/**
 * Stripe redirects here after the hosted onboarding flow, whether or not
 * the host actually finished it -- so this is never the source of truth
 * for "onboarding complete" (that's account.updated, next phase). It does
 * one direct accounts.retrieve() to reflect current status immediately,
 * which is what makes this phase testable without the webhook existing
 * yet; the webhook becomes the ongoing sync once it's built.
 */
export default async function StripeReturnPage() {
  const host = await getCurrentHost();
  if (!host) {
    redirect("/host/login");
  }

  let synced = false;
  if (host.stripeAccountId) {
    try {
      const account = await getStripeClient().accounts.retrieve(host.stripeAccountId);
      await setHostStripeCapabilities(host.id, {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });
      synced = true;
    } catch {
      // Stripe unreachable or the account id is stale -- fall through to
      // the generic message below rather than crashing the return trip.
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center sm:px-8">
      <h1 className="mb-3 font-serif text-2xl font-bold text-sage">
        {synced ? "Status updated." : "Almost there."}
      </h1>
      <p className="mb-6 text-[15px] leading-relaxed text-charcoal/70">
        {synced
          ? "We checked in with Stripe and updated your account status."
          : "We couldn't confirm your Stripe status just now. Check back on your host page in a moment."}
      </p>
      <Link
        href="/host"
        className="inline-block rounded-full bg-sage px-6 py-3 text-sm font-bold text-linen no-underline hover:bg-sage-dark"
      >
        Back to your host page
      </Link>
    </div>
  );
}
