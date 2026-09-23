import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getSiteUrl } from "@/lib/stripe";
import { calculateApplicationFeeCents } from "@/lib/pricing";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import type { Intent, Timeline } from "@prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS: Intent[] = ["EXPLORING", "BUYING", "RENTING"];
const TIMELINES: Timeline[] = ["JUST_LOOKING", "MOVING_SOON"];
// Real Stripe API calls per request (unlike /api/rsvp, which is
// unguarded) -- worth its own limit against abuse/cost.
const RATE_LIMIT = { limit: 10, windowMs: 60_000 };

type CheckoutBody = {
  eventSlug?: unknown;
  email?: unknown;
  name?: unknown;
  intent?: unknown;
  timeline?: unknown;
  agentContactConsent?: unknown;
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(`checkout:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug : undefined;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined;
  const intent = INTENTS.includes(body.intent as Intent) ? (body.intent as Intent) : undefined;
  const timeline = TIMELINES.includes(body.timeline as Timeline)
    ? (body.timeline as Timeline)
    : undefined;
  const agentContactConsent = body.agentContactConsent === true;

  if (!eventSlug || !email || !intent || !timeline) {
    return NextResponse.json(
      { error: "eventSlug, email, intent, and timeline are required" },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { host: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  // Never trust a client-supplied price -- priceCents/currency/host are
  // always read fresh from the DB, right here.
  if (event.priceCents <= 0) {
    return NextResponse.json(
      { error: "This event is free — use /api/rsvp instead" },
      { status: 400 },
    );
  }
  if (
    !event.host ||
    !event.host.stripeAccountId ||
    !event.host.stripeChargesEnabled ||
    !event.host.stripePayoutsEnabled
  ) {
    return NextResponse.json(
      { error: "This host hasn't finished payment setup yet" },
      { status: 409 },
    );
  }

  const stripe = getStripeClient();
  const siteUrl = getSiteUrl();
  const applicationFeeCents = calculateApplicationFeeCents(event.priceCents);

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: event.currency,
            unit_amount: event.priceCents,
            product_data: { name: event.title },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeCents,
        transfer_data: { destination: event.host.stripeAccountId },
      },
      // Read back by the webhook to build the Attendee/Pass once payment
      // actually completes -- see lib/create-pass.ts and the webhook route.
      metadata: {
        eventId: event.id,
        eventSlug: event.slug,
        email,
        name: name ?? "",
        intent,
        timeline,
        agentContactConsent: String(agentContactConsent),
      },
      success_url: `${siteUrl}/events/${event.slug}?checkout=success`,
      cancel_url: `${siteUrl}/events/${event.slug}?checkout=cancelled`,
    });
  } catch (err) {
    console.error("Stripe checkout session creation failed", err);
    return NextResponse.json({ error: "Could not reach Stripe. Please try again." }, { status: 502 });
  }

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }

  // PENDING the moment the session exists, before anyone has paid -- the
  // webhook is what moves this to PAID (or EXPIRED/FAILED) and creates the
  // Pass. If this write fails after the Stripe call above already
  // succeeded, the webhook's upsert-by-session-id self-heals: see
  // DECISIONS.md.
  await prisma.payment.create({
    data: {
      eventId: event.id,
      stripeCheckoutSessionId: session.id,
      hostStripeAccountId: event.host.stripeAccountId,
      amountCents: event.priceCents,
      applicationFeeCents,
      currency: event.currency,
      status: "PENDING",
    },
  });

  return NextResponse.json({ checkoutUrl: session.url }, { status: 201 });
}
