# Haven Rush — project brief for Claude Code

Read this first, then `/docs`. Where this file and a docs file disagree, this file wins.

## What we're building
Haven Rush is an event marketing platform for **discovering and experiencing places** — homes, apartments, coworking spaces, vacation stays, hotels, neighborhoods, commercial spaces, community spaces, new developments, and local destinations. **Real estate is one category within Haven Rush, not a requirement for every event.** The only bar for hosting: the event helps people discover and experience a place, in person.

Anyone with a place, a property owner or manager, brokerage, builder, landlord, coworking operator, hotel, or local venue, can host a Haven Rush event on their space. Real-estate hosts (sale, rental, lease, showcase) remain the anchor use case and the first market, but the platform and copy should not gate participation on a real-estate purpose.

Every event still runs on the same mechanic: coffee, live music, local food, a stamp-collecting "passport." Attendees get in free. Hosts, brokerages/agents where applicable, and local sponsors pay for participation and permission-based leads.

**Haven Rush is not a brokerage.** It never represents buyers, sellers, landlords, or tenants. Licensed partner agents and property managers do that, for the events where a licensed party is involved.

**Brand note (on hold):** a tropical/place-discovery visual direction (pineapple motif, brighter palette) has been discussed as a better fit for this broader scope than the current sage/honey "neighborhood" identity, but it is **not being built yet**. Keep the current design tokens below until told otherwise.

## Platform model: hosts create experiences, Haven Rush approves
Haven Rush is a platform, not an event producer. **Hosts create their own experiences; Haven Rush reviews and approves before anything goes public.** This replaces any earlier assumption that admin/Haven Rush creates every event directly.

Flow: a host applies → Haven Rush approves the host → the approved host picks a place and an experience format (the four existing types are formats, not a fixed ceiling) → the host builds the experience (activities/stops, participating businesses, schedule, capacity, price) → submits for review → Haven Rush approves/rejects → once approved, it's published and the existing consumer flow (browse, RSVP, QR stamps, passport) runs unchanged.

The distinctive part of the product: Haven Rush gives hosts a structured format for creating something they wouldn't normally offer, not a generic "list your event" tool.

`/admin` shifts role: it becomes the **host application and experience approval queue** first, with direct admin event creation as a secondary/exception path (useful for Haven Rush's own seeded or admin-run pilots), not the primary way events get made.

## Pricing model (launch)
Haven Rush launches as a simple two-sided marketplace. Keep it this simple — don't add complexity beyond what's below without an explicit decision to do so.

- **Hosts create and list experiences for $0 upfront.** No listing fee, no subscription.
- **Consumers pay the host's listed price** to book an experience. The host sets this price (free-form field, not a tier enum). $0 is a valid price (free experience).
- **Haven Rush keeps a percentage of each paid booking**; the host receives the remainder after Haven Rush's cut and payment-processing costs. The percentage is a single configurable value (env var or settings table, not hardcoded in multiple places) — exact number still being decided against comparable marketplaces and Haven Rush's costs, so don't hardcode an assumption in the UI copy either. Pull it from the same config value.
- **Free experiences ($0) earn Haven Rush nothing** — no commission, no Stripe transaction at all for those.
- **Not at launch — do not build:** paid add-ons/upsells, host subscriptions, business referral/affiliate fees, sponsorships, advertising.

## Files
- `docs/mockup/Haven_Rush_App_v2_dc.html` — visual + interaction reference (5 views). **Not a codebase**: it is a design-tool export (`x-dc` format, inline styles, `useState`-style view switching) that also expects `support.js` and `ios-frame.jsx`. Rebuild it; don't try to run or extend it.
- `docs/brand-guidelines.md` — voice, colors, type, signage, compliance notes.
- `docs/business-plan.md` — products, customers, revenue model, launch plan.
- `docs/gamification-reference.md` — mechanics reference for designing experience formats later (not build instructions).

## Stack (decided)
Next.js (App Router) + TypeScript + Tailwind CSS + Prisma. Real URLs replace the mockup's view switching.

- **Database:** Supabase Postgres for dev and production (no SQLite, so enums/JSON behave the same everywhere). Prisma uses two URLs: `DATABASE_URL` = Supabase pooled connection (port 6543, `?pgbouncer=true`) for the app, `DIRECT_URL` = Supabase **session pooler** connection (port 5432; works over IPv4, unlike the plain direct connection) for migrations. One Supabase project (`haven-rush`) is used for now; a separate production project or a paid plan comes at launch.
- **Lock down the auto-generated API:** Supabase exposes `public` tables through its REST API using the anon key. Enable Row Level Security on every table with no policies, so only the server (Prisma, via the database connection) can read or write. Attendee emails live here. Never use the Supabase client or anon key in browser code, and never commit `.env`.
- **Hosting:** Vercel for the app. Cloudflare is DNS + redirects only (no Cloudflare Workers/D1).
- **Domain:** `havenrush.com` is canonical. All other Haven Rush domains 301-redirect to it. Use absolute URLs built from a `NEXT_PUBLIC_SITE_URL` env var (QR codes encode `${SITE_URL}/s/[scanToken]` and can't be reprinted).

| Mockup view | Route |
|---|---|
| Home | `/` |
| Events feed | `/events` |
| Event detail + RSVP | `/events/[slug]` |
| Mobile passport | `/passport/[token]` |
| For Agents & Hosts | `/agents` |
| QR scan landing | `/s/[scanToken]` |

## Design tokens (Tailwind theme)
- sage `#2E5A44` (primary), honey `#F2A93B` (accent), charcoal `#1F2421` (text), linen `#F9F8F3` (page background, never pure white for the page)
- honey-text `#C07F1E` — the darker honey the mockup uses for small uppercase labels (contrast)
- Headlines: Domine (serif). Body/UI: Plus Jakarta Sans.
- Voice: warm, neighborhood-proud, never salesy, no real-estate jargon. B2B pages are clear and ROI-focused.

## Vocabulary (canonical)
**The scavenger-hunt mechanic is the heart of Haven Rush.** Every format runs on a passport: attendees collect stamps by scanning QR codes at stops, unlock rewards, and win prizes.

Four event types. The first three are the signature formats. The fourth is a B2B product.

1. **House Party** (`HOUSE_PARTY`): one property, local coffee, live music, neighbors.
2. **Home Hunt** (`HOME_HUNT`): a self-guided walk through ~10-20 properties, food stops, games, stamped passport. **Use "Hunt", not "Crawl".**
3. **Open House Weekend** (`OPEN_HOUSE_WEEKEND`): a recurring multi-property scavenger hunt over a weekend, self-paced.
4. **Home Fair** (`HOME_FAIR`): a builder- or property-owner-hosted market gathering, model homes/units, local makers, vendor booths.

Every event may optionally record a purpose — never required.

Keep the enum in one place (`lib/event-types.ts`).

Home page shows House Party, Home Hunt, and Open House Weekend as the three main cards; Home Fair appears as a smaller "For builders" card.

## Product rules that must hold
1. **Purpose is optional, not required.**
2. **Consent before any lead leaves the system.** Explicit, unchecked-by-default consent box at RSVP.
3. **Attribution.** Footer/`/agents`: "Haven Rush is an event marketing platform. Licensed real estate services, where applicable, are provided by independent licensed partners."
4. **RESPA / fair market value.** Real-estate-category events only, `TODO(legal)` placeholder.
4a. **Liability waiver.** RSVP/registration needs a liability waiver/ToS checkbox in addition to the consent checkbox, `TODO(legal)` placeholder, stored acceptance with timestamp + text version.
5. **Utah review pending.**
6. **No unsourced statistics on public pages.**
7. Passport and pass URLs use unguessable tokens. No login for attendees.

## Placeholder data
The mockup's events are set in Austin, TX. Treat as placeholder seed data.

## Working style
Build in phases; after each, run it, summarize what works, and stop for review before the next. Note assumptions in `DECISIONS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
