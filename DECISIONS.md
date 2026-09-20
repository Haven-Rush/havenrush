# Decisions & assumptions

## CLAUDE.md replaced verbatim; Home Fair copy/seed corrected (2026-09-21)
The user supplied an updated CLAUDE.md and asked that the repo's copy be
replaced with it exactly. Beyond the Vocabulary section (expected — it's
what prompted the update), the Stack section also changed: it now spells
out `NEXT_PUBLIC_SITE_URL` for building absolute URLs (QR codes encode
`${SITE_URL}/s/[scanToken]`), clarifies Cloudflare is DNS/redirects only
(no Workers/D1), and names the Supabase project (`haven-rush`). Everything
else (Files, Design tokens, Product rules, Placeholder data, Working
style) was byte-identical. `NEXT_PUBLIC_SITE_URL` isn't wired up yet since
the `/s/[scanToken]` scan flow doesn't exist yet (Phase 3/4) — flagging so
it isn't missed when that's built.

Corrected two things from the previous entry below to match the new
CLAUDE.md's exact wording:
- Home Fair's home-page card copy is now the literal string from CLAUDE.md
  ("A builder's new neighborhood, opened up like a market. Tour model
  homes, meet local makers, and collect stamps."), replacing the
  looser paraphrase used before.
- The placeholder Home Fair seed event is no longer "Mueller New Home
  Market" (a real, established Austin neighborhood) — it's now "Sunday
  Market at Willow Creek" (`sunday-market-at-willow-creek`), matching
  CLAUDE.md's suggested placeholder exactly. Willow Creek is a fictional
  new-construction community, which fits the corrected Home Fair concept
  (a builder opening a *new* neighborhood like a market day) better than
  reusing a real, already-established one. Broadened its stops beyond
  model homes + coffee/food to include the lender/designer/mover booths
  and live-music stage CLAUDE.md now describes as part of the format,
  using VENDOR/MUSIC stop kinds already in the schema (no schema change
  needed).

No migration change was needed for this pass: migration
`20260921120000_rename_home_crawl_add_home_fair` (added in the previous
entry) was already a new, additive migration — it doesn't edit any
previously shipped migration file, and it already does exactly what's
required here (rename `HOME_CRAWL`→`HOME_HUNT` in place, add `HOME_FAIR`
back, no existing rows touched).

## Event types: Home Crawl renamed to Home Hunt, Home Fair restored (2026-09-21)
Per explicit instruction, renamed `HOME_CRAWL` to `HOME_HUNT` everywhere
(enum, `lib/event-types.ts`, seed data ids/slugs/titles, UI copy — "Find a
Hunt", "Upcoming hunts", "South Congress Tasting Hunt", "Hyde Park Porch
Hunt") and restored `HOME_FAIR` as a fourth event type with new
builder-hosted-market copy, reversing the previous decision below to retire
it. There are now four event types: House Party, Home Hunt, Open House
Weekend, Home Fair.

The home page shows House Party / Home Hunt / Open House Weekend as the
three equal-sized main cards, with a smaller "For builders" card for Home
Fair below them (per instruction). `/agents` now has a package card for
all four types.

Added a placeholder Home Fair seed event, "Mueller New Home Market"
(Mueller is a real Austin master-planned community known for new
construction — fits the "builder-hosted market" framing), with five
LISTING-only stops representing builder model homes plus a coffee cart and
a food-truck stop. Its LISTING stops use `brokerage`/`agentName` loosely to
mean "builder name" / "on-site sales team" rather than a licensed
third-party brokerage — the Stop model has no separate "builder" concept,
and adding one felt like scope creep for placeholder data; flagging this
as a modeling shorthand rather than a schema change.

Migration `20260921120000_rename_home_crawl_add_home_fair` renames the
`HOME_CRAWL` enum value in place (Postgres supports `ALTER TYPE ... RENAME
VALUE`, a metadata-only change — existing rows read as the new label with
no data migration needed) and adds `HOME_FAIR` back with `ALTER TYPE ...
ADD VALUE` (natively supported, unlike removal). The migration doesn't use
the new value anywhere in the same file, since Postgres disallows using a
freshly added enum value within the transaction that added it.

## Event type: Home Fair retired, replaced by Open House Weekend (2026-09-20)
Per explicit instruction, removed `HOME_FAIR` everywhere (home page card,
events feed, seed data, `/agents`, the `EventType` enum) and replaced its
slot with `OPEN_HOUSE_WEEKEND`, which already existed in the enum/vocabulary
as a docs-only type. The seeded "Austin Housing Fair" event became "Austin
Open House Weekend · Nov 7–8 · Citywide", with its stops changed from
VENDOR/COFFEE booths to five LISTING-only stops spread across neighborhoods
(South Congress, Bouldin Creek, Hyde Park, Zilker, Travis Heights), each
with a brokerage/agent — two of those brokerages (Zilker Realty Group,
Travis Heights Realty) are new placeholder seed data introduced for this
event. Its event-level sponsors (Lonestar Lending, Capital Title) were kept
as-is since Sponsor is a separate concept from passport stops.

Since the enum already had a Prisma migration applied in principle (Phase 2
shipped `20260920221259_init`), removing `HOME_FAIR` from a live enum isn't
a simple column edit — Postgres has no `DROP VALUE` for enums. Added migration
`20260921000000_remove_home_fair_event_type`, which moves any existing
`HOME_FAIR` rows to `OPEN_HOUSE_WEEKEND` first, then swaps the column to a
freshly created enum without the retired value (rename-old/create-new/cast/drop-old
pattern) rather than editing the already-shipped migration files.

## Stack: Supabase Postgres for dev and prod (2026-09-20)
Originally CLAUDE.md called for SQLite in local dev and Postgres in production.
Per explicit instruction, we switched to Postgres via Supabase for **both**
environments — no SQLite. Prisma's `datasource db` uses two env vars:
- `DATABASE_URL` — Supabase's transaction pooler (port 6543, `pgbouncer=true`).
  Used by the app at runtime (Prisma Client).
- `DIRECT_URL` — Supabase's direct connection (port 5432, no pooler). Used only
  by Prisma Migrate, which needs session-level Postgres features the
  transaction pooler doesn't support.

Row Level Security is enabled (no policies) on every table in a dedicated
migration, so Supabase's auto-generated PostgREST/GraphQL API cannot read or
write any table. The app talks to Postgres directly through Prisma using the
`postgres` role, which has `BYPASSRLS` on Supabase projects by default, so
this doesn't affect the app itself — it only locks the tables away from the
REST API surface, which we don't use.

Hosting target is Vercel, so no Cloudflare-specific adapters (e.g. no
`@cloudflare/next-on-pages`, no D1/KV bindings).

This repo has no live Supabase project or network access to one, so
`prisma migrate dev`/`db seed` haven't been run here — see README for the
setup steps to run against a real project.

## Phase 1 scaffold
- Reorganized the three brief-referenced docs (`Haven_Rush_App_v2_dc.html`,
  `brand-guidelines.md`, `business-plan.md`) from the repo root into `docs/`
  and `docs/mockup/` to match the paths CLAUDE.md already references.
- The mockup's top nav is a demo view-switcher (Home / Event Example / Mobile
  Passport / For Agents & Hosts), not a real site's navigation — a visitor
  doesn't navigate to "a random event" or "the mobile passport" from a global
  nav. Real nav is Home (logo) / Events / For Agents & Hosts, plus a
  "Find a Crawl" CTA linking to `/events`.
- Fixed per the brief: every event in `/events` links to its own
  `/events/[slug]`, and the passport's stamp count / reward progress is
  computed from stamp + reward-tier data rather than hardcoded.
- Event detail pages also show the hosting brokerage name(s), derived from
  LISTING stops, per product rule #2 (attribution) — not present in the
  mockup's detail view, but required by CLAUDE.md.
- `/s/[scanToken]` (QR scan landing) is not built yet — it lands with the
  scan flow in Phase 3/4. The passport's "Scan QR" affordance is a static
  label for now, not a dead link.
- The RSVP flow on the event detail page is visual/local-state only in
  Phase 1 (matches the mockup's 3-step flow: Get Pass → preferences →
  confirmation). Phase 4 wires "Continue" to `POST /api/rsvp` and adds the
  email + consent fields the spec calls for; the confirmation step links to
  a seeded demo pass until then.
