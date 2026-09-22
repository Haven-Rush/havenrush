# Haven Rush — project brief for Claude Code

Read this first, then `/docs`. Where this file and a docs file disagree, this file wins.

## What we're building
Haven Rush is an event marketing platform for **discovering and experiencing places** — homes, apartments, coworking spaces, vacation stays, hotels, neighborhoods, commercial spaces, community spaces, new developments, and local destinations. **Real estate is one category within Haven Rush, not a requirement for every event.** The only bar for hosting: the event helps people discover and experience a place, in person.

Anyone with a place, a property owner or manager, brokerage, builder, landlord, coworking operator, hotel, or local venue, can host a Haven Rush event on their space. Real-estate hosts (sale, rental, lease, showcase) remain the anchor use case and the first market, but the platform and copy should not gate participation on a real-estate purpose.

Every event still runs on the same mechanic: coffee, live music, local food, a stamp-collecting "passport." Attendees get in free. Hosts, brokerages/agents where applicable, and local sponsors pay for participation and permission-based leads.

**Haven Rush is not a brokerage.** It never represents buyers, sellers, landlords, or tenants. Licensed partner agents and property managers do that, for the events where a licensed party is involved.

**Brand note (on hold):** a tropical/place-discovery visual direction (pineapple motif, brighter palette) has been discussed as a better fit for this broader scope than the current sage/honey "neighborhood" identity, but it is **not being built yet**. Keep the current design tokens below until told otherwise.

## Files
- `docs/mockup/Haven_Rush_App_v2_dc.html` — visual + interaction reference (5 views). **Not a codebase**: it is a design-tool export (`x-dc` format, inline styles, `useState`-style view switching) that also expects `support.js` and `ios-frame.jsx`. Rebuild it; don't try to run or extend it.
- `docs/brand-guidelines.md` — voice, colors, type, signage, compliance notes.
- `docs/business-plan.md` — products, customers, revenue model, launch plan.

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
- Headlines: Domine (serif). Body/UI: Plus Jakarta Sans. (Brand doc names Recoleta/Ogg as ideals; Domine is the free stand-in the mockup uses.)
- Voice: warm, neighborhood-proud, never salesy, no real-estate jargon. B2B pages are clear and ROI-focused.

## Vocabulary (canonical)
**The scavenger-hunt mechanic is the heart of Haven Rush.** Every format runs on a passport: attendees collect stamps by scanning QR codes at stops, unlock rewards, and win prizes. Never dilute this. Treat it as the brand's signature, not a feature.

Four event types. The first three are the signature formats and the priority for the build, copy, and design. The fourth is a B2B product.

1. **House Party** (`HOUSE_PARTY`): one property, local coffee, live music, neighbors. Smallest format. Works for a home for sale, a single rental unit, or a small commercial space being marketed.
2. **Home Hunt** (`HOME_HUNT`): a self-guided walk through ~10-20 properties in an afternoon, with food stops, games, and a stamped passport. Properties can mix for-sale homes, rentals, and leasing units in one hunt. **Use "Hunt", not "Crawl".** "Crawl" reads as a pub crawl and drops the scavenger idea. The mockup says "Crawl"; change all UI copy and titles to "Hunt" (button "Find a Hunt"; "South Congress Tasting Hunt"; "Hyde Park Porch Hunt").
3. **Open House Weekend** (`OPEN_HOUSE_WEEKEND`): a recurring multi-property scavenger hunt over a defined weekend, properties across a city or several neighborhoods, one digital passport, self-paced. Any mix of sale, rental, and lease properties. Differs from Home Hunt in scale and pace: a Hunt is one walkable afternoon; a Weekend is spread out and repeats (monthly is the plan). Card copy: "A whole weekend, homes across town, one passport. Go at your own pace and collect stamps."
4. **Home Fair** (`HOME_FAIR`): not a generic home show. It is a **builder- or property-owner-hosted market gathering**: a builder opens a new community, or a large multifamily/commercial owner opens a property, like a market day, with model homes or units, local makers and food, live music, and lender/designer/mover/leasing-agent booths, and attendees collect stamps by visiting booths and units. Sold to builders, property owners, and sponsors (vendor booths, sponsorships). Card copy: "A builder's new neighborhood, opened up like a market. Tour model homes, meet local makers, and collect stamps." Seed a placeholder such as "Sunday Market at Willow Creek · Nov 7-8 · New neighborhood" (rename later). Its host may be a builder or property owner rather than a brokerage: show the host and any listing brokerage or leasing office.

Every event may optionally record a purpose (see Product rules) — never required, and most useful for the real-estate category.

Keep the enum in one place (`lib/event-types.ts`) so a rename is a one-line change. The brand doc and business plan already use "Home Hunt". These four types are the real-estate anchor category; the platform's scope is broader (see What we're building) and may grow new categories later (e.g. coworking tours, vacation-stay showcases) — don't hardcode assumptions that every event is real estate (e.g. avoid requiring a listing brokerage on every Stop).

Home page shows House Party, Home Hunt, and Open House Weekend as the three main cards; Home Fair appears as a smaller "For builders" card or link to `/agents`. `/agents` has package cards for House Party, Home Hunt, Open House Weekend, and a Home Fair option for builders.

## Product rules that must hold
1. **Purpose is optional, not required.** An event may optionally record what it's for (e.g. sale, rental, lease, showcase, stay, visit, tour) but this is descriptive, not a gate. Don't block event creation on it. Real-estate events should still show their purpose plainly when set (e.g. a small "For Sale" / "For Rent" / "Leasing" badge), since it matters to that audience.
2. **Consent before any lead leaves the system.** Sharing an attendee's details with a host, agent, landlord, or leasing office happens only if they ticked an explicit, unchecked-by-default consent box at RSVP. Store the consent flag, timestamp, and the exact consent text shown.
3. **Attribution.** Any listing stop or event page shows the hosting party's name (brokerage, property manager, leasing office, coworking operator, venue, whichever applies). Footer and `/agents` carry: "Haven Rush is an event marketing platform. Licensed real estate services, where applicable, are provided by independent licensed partners."
4. **RESPA / fair market value.** Applies specifically to real-estate-category events. `/agents` and any sponsor-facing copy for those needs a short disclaimer that pricing reflects fair market value for advertising exposure. Use placeholder text and mark it `TODO(legal)`.
5. **Utah review pending.** The business plan says advertising, referral, compensation and lead-gen rules need Utah review before launch, for the real-estate category specifically. Don't hardcode legal claims; keep disclaimer copy in one editable file.
6. **No unsourced statistics on public pages.** The brand doc quotes lead-cost and NAR figures (cost per lead, "78% work with first agent"). Don't publish them until sourced.
7. Passport and pass URLs use unguessable tokens (no sequential IDs). No login for attendees.

## Placeholder data
The mockup's events are set in Austin, TX (South Congress, Bouldin Creek, Hyde Park). Treat as placeholder seed data; make city/neighborhood plain data, not hardcoded UI.

## Working style
Build in phases; after each, run it, summarize what works, and stop for review before the next. Prefer small, tested pieces. Note anything you assumed in `DECISIONS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
