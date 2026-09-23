import Stripe from "stripe";

let stripeClient: Stripe | undefined;

/**
 * Lazily-constructed Stripe client. Constructing at module-import time
 * would throw immediately if STRIPE_SECRET_KEY isn't set, even for code
 * paths that never touch Stripe (same reasoning as
 * lib/admin-auth.ts's getSessionSecret()).
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

/** Absolute site URL for Stripe redirect targets (account links, Checkout). */
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }
  return siteUrl.replace(/\/$/, "");
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}
