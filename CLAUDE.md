# Haven Rush — project brief for Claude Code

Read this first, then `/docs`. Where this file and a docs file disagree, this file wins.

## What we're building
Haven Rush is an event marketing platform for **real estate spaces**, not just homes for sale. Any real estate owner or manager, brokerage, builder, landlord, or property manager, can host a Haven Rush event on their space **when the event serves a real estate purpose**: selling, renting, leasing, pre-leasing, or showcasing the property to prospective buyers/tenants/attendees who might engage with it commercially. It is not a venue-rental or generic-party platform; a real estate purpose is the eligibility bar for every event, checked at listing/host onboarding, not just implied by the format.

Examples of what qualifies: a for-sale single-family home (House Party, Home Hunt), a new apartment complex doing a leasing preview, a builder's model-home community (Home Fair), a commercial space marketed for lease, a short-term rental showcased to build bookings, a multi-property weekend spanning any mix of the above (Open House Weekend). What doesn't qualify: hosting at a property purely as a venue for an unrelated event with no connection to selling, renting, leasing, or showcasing it.

Every event still runs on the same mechanic: coffee, live music, local food, a stamp-collecting "passport." Attendees get in free. Licensed agents, brokerages, property managers, and local sponsors pay for participation and permission-based leads.

**Haven Rush is not a brokerage.** It never represents buyers, sellers, landlords, or tenants. Licensed partner agents and property managers do that.

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

Every event, regardless of type, must have a stated real estate purpose (sale, rental, lease, or showcase) recorded on the Event record. Reflect this in the admin event form as a required field, not just a type dropdown.

Keep the enum in one place (`lib/event-types.ts`) so a rename is a one-line change. The brand doc and business plan already use "Home Hunt".

Home page shows House Party, Home Hunt, and Open House Weekend as the three main cards; Home Fair appears as a smaller "For builders" card or link to `/agents`. `/agents` has package cards for House Party, Home Hunt, Open House Weekend, and a Home Fair option for builders.

## Product rules that must hold
1. **Every event must have a stated real estate purpose.** At creation, an event records which purpose it serves: sale, rental, lease, or showcase. This isn't cosmetic — it's what keeps Haven Rush from being read as a generic party-venue platform. Show it (plainly, not legalistically) on the event page.
2. **Consent before any lead leaves the system.** Sharing an attendee's details with an agent, landlord, or leasing office happens only if they ticked an explicit, unchecked-by-default consent box at RSVP. Store the consent flag, timestamp, and the exact consent text shown.
3. **Attribution.** Any listing stop or event page shows the hosting licensed party's name (brokerage, property manager, or leasing office, whichever applies). Footer and `/agents` carry: "Haven Rush is an event marketing platform. Real estate services are provided by independent licensed partners."
4. **RESPA / fair market value.** `/agents` and any sponsor-facing copy needs a short disclaimer that pricing reflects fair market value for advertising exposure. Use placeholder text and mark it `TODO(legal)`.
5. **Utah review pending.** The business plan says advertising, referral, compensation and lead-gen rules need Utah review before launch. Don't hardcode legal claims; keep disclaimer copy in one editable file.
6. **No unsourced statistics on public pages.** The brand doc quotes lead-cost and NAR figures (cost per lead, "78% work with first agent"). Don't publish them until sourced.
7. Passport and pass URLs use unguessable tokens (no sequential IDs). No login for attendees.

## Placeholder data
The mockup's events are set in Austin, TX (South Congress, Bouldin Creek, Hyde Park). Treat as placeholder seed data; make city/neighborhood plain data, not hardcoded UI.

## Working style
Build in phases; after each, run it, summarize what works, and stop for review before the next. Prefer small, tested pieces. Note anything you assumed in `DECISIONS.md`.
