"use server";

import { redirect } from "next/navigation";
import { getCurrentHost } from "@/lib/current-host";
import { getStripeClient, getSiteUrl } from "@/lib/stripe";
import { setHostStripeAccountId } from "@/lib/hosts-db";

/**
 * Creates (or reuses) the host's Express connected account, then redirects
 * to a fresh Stripe-hosted onboarding link. Called from a plain <form
 * action> button on /host, so it can redirect() directly -- no client
 * state to preserve.
 */
export async function connectStripe() {
  const host = await getCurrentHost();
  if (!host || host.status !== "APPROVED") {
    redirect("/host");
  }

  const stripe = getStripeClient();
  const siteUrl = getSiteUrl();

  let accountLinkUrl: string;
  try {
    let accountId = host.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: host.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await setHostStripeAccountId(host.id, accountId);
    }

    // Account Links expire quickly and are single-use -- always create a
    // fresh one rather than trying to reuse/cache it. refresh_url points
    // back at /host so a host who lets the link expire mid-flow just
    // clicks "Connect with Stripe" again, which re-enters this action.
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${siteUrl}/host`,
      return_url: `${siteUrl}/host/stripe/return`,
    });
    accountLinkUrl = accountLink.url;
  } catch {
    // A Stripe outage/network issue shouldn't crash the host's dashboard
    // to Next.js's generic error page -- same "redirect with an error
    // flag" pattern as the admin/host login actions.
    redirect("/host?stripeError=1");
  }

  redirect(accountLinkUrl);
}
