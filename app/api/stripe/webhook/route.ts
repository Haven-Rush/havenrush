import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { calculateApplicationFeeCents } from "@/lib/pricing";
import { createOrUpdatePass, listingAgentIds } from "@/lib/create-pass";
import type { Intent, Timeline } from "@prisma/client";

const INTENTS: Intent[] = ["EXPLORING", "BUYING", "RENTING"];
const TIMELINES: Timeline[] = ["JUST_LOOKING", "MOVING_SOON"];

/**
 * The source of truth for paid bookings (CLAUDE.md/DECISIONS.md: a Pass
 * for a paid event is only ever created here, never on the client
 * redirect). Verifies Stripe's signature against the raw body -- reading
 * `request.text()` before any JSON parsing is what makes that possible;
 * this Next.js version's route handlers need no special config for it
 * (unlike the old Pages Router's `bodyParser: false`).
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      await handleCheckoutFailedOrExpired(
        event.data.object as Stripe.Checkout.Session,
        event.type,
      );
      break;
    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
    default:
      // Unhandled event types are expected -- a Stripe webhook destination
      // is commonly subscribed to more events than this endpoint acts on.
      // Ack and move on rather than treating it as an error.
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Cards (the only method this app offers today) complete synchronously;
  // a non-"paid" status here would mean an async payment method is
  // pending -- checkout.session.async_payment_succeeded (not currently
  // handled, since none are enabled) would be the actual completion event
  // in that case, not this one.
  if (session.payment_status !== "paid") return;

  const metadata = session.metadata ?? {};
  const eventId = metadata.eventId;
  const email = metadata.email;
  const intent = metadata.intent as Intent;
  const timeline = metadata.timeline as Timeline;
  if (!eventId || !email || !INTENTS.includes(intent) || !TIMELINES.includes(timeline)) {
    console.error("checkout.session.completed: missing/invalid metadata", {
      sessionId: session.id,
      metadata,
    });
    return;
  }
  const name = metadata.name || undefined;
  const agentContactConsent = metadata.agentContactConsent === "true";

  const dbEvent = await prisma.event.findUnique({
    where: { id: eventId },
    include: { stops: true, host: true },
  });
  if (!dbEvent) {
    console.error("checkout.session.completed: event not found", { sessionId: session.id, eventId });
    return;
  }

  const pass = await createOrUpdatePass({
    eventId: dbEvent.id,
    email,
    name,
    intent,
    timeline,
    agentContactConsent,
    listingAgentIds: listingAgentIds(dbEvent.stops),
  });

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  // Normally set by POST /api/checkout at PENDING creation; recomputed
  // here only as a self-heal fallback if that row is somehow missing (see
  // DECISIONS.md) -- same deterministic inputs either way.
  const amountCents = session.amount_total ?? dbEvent.priceCents;

  await prisma.payment.upsert({
    where: { stripeCheckoutSessionId: session.id },
    update: {
      status: "PAID",
      passId: pass.id,
      stripePaymentIntentId: paymentIntentId,
    },
    create: {
      eventId: dbEvent.id,
      passId: pass.id,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      hostStripeAccountId: dbEvent.host?.stripeAccountId ?? "",
      amountCents,
      applicationFeeCents: calculateApplicationFeeCents(amountCents),
      currency: session.currency ?? dbEvent.currency,
      status: "PAID",
    },
  });
}

async function handleCheckoutFailedOrExpired(
  session: Stripe.Checkout.Session,
  eventType: "checkout.session.expired" | "checkout.session.async_payment_failed",
) {
  const status = eventType === "checkout.session.expired" ? "EXPIRED" : "FAILED";
  // updateMany (not update) so this is a safe no-op if the Payment row
  // doesn't exist, and the `status: PENDING` guard means an out-of-order
  // delivery can never regress an already-PAID row.
  await prisma.payment.updateMany({
    where: { stripeCheckoutSessionId: session.id, status: "PENDING" },
    data: { status },
  });
}

async function handleAccountUpdated(account: Stripe.Account) {
  await prisma.host.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      stripeChargesEnabled: account.charges_enabled ?? false,
      stripePayoutsEnabled: account.payouts_enabled ?? false,
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);
  if (!paymentIntentId) return;
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status: "REFUNDED" },
  });
}
