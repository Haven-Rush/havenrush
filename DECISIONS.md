# Decisions & assumptions

## Strip a dotenv log line that had leaked into migration.sql (2026-09-21)
The P3009 failure in the previous entry turned out to have a second layer:
once `PRISMA_RESOLVE_ROLLED_BACK` cleared the stuck failed-migration
record, Vercel's retry of `prisma migrate deploy` failed again, this time
with a Postgres syntax error at `◇ injected env (0) from .env` on line 1
of `20260920221259_init/migration.sql`. That line (plus a
`Loaded Prisma config from prisma.config.ts.` line and a blank line right
after it) isn't SQL at all — it's `dotenv`'s own console log line from
`prisma.config.ts`'s `import "dotenv/config"`, which must have been
captured into the file back when this migration was originally generated
with its output redirected into `migration.sql` (e.g.
`prisma migrate dev > migration.sql` or similar, rather than letting
Prisma write the file itself). Checked all 4 migration files
(`grep` for that line and other dotenv/Prisma banner text anywhere in
them, not just line 1) — only `20260920221259_init/migration.sql` had it,
right at the top.

None of the 4 migrations has ever successfully applied to any database
(this is the project's first real deploy attempt, still failing before
this fix), so editing a shipped migration file — normally off-limits once
applied — was safe here: removed the 3 junk lines, leaving line 1 as
`-- CreateSchema`, the file's original first real line.

To stop it recurring, `prisma.config.ts` now calls `dotenv`'s `config()`
directly with `{ quiet: true }` instead of the side-effect
`import "dotenv/config"`, which suppresses the "injected env" log line at
the source — verified with `npx prisma generate`, which no longer prints
it. This only prevents the log line from being generated in the first
place; it doesn't change how migrations are written (that's on whoever
runs `prisma migrate dev` next to not redirect its console output into
the SQL file). Grepped the whole repo for other `dotenv` entry points —
`prisma.config.ts` is the only one, so there's nowhere else this could
leak from.

## Recover from a failed migration on Vercel without a terminal (2026-09-21)
First real Vercel deploy against the (new, empty) Supabase database hit
`prisma migrate deploy` failing with **P3009**: an earlier, interrupted
build had left migration `20260920221259_init` recorded in Postgres's
`_prisma_migrations` table as failed, and every subsequent `migrate
deploy` refuses to proceed past a failed migration rather than risk
re-applying something partially done. Since the database is new and
empty, there's nothing to actually roll back — the fix is just telling
Prisma to forget the failed attempt so `migrate deploy` retries it fresh.
Normally that's `prisma migrate resolve --rolled-back <name>` run once by
hand, but the user has no terminal access to this Vercel project, so it
needed to be buildable from an env var instead:

`scripts/vercel-build.sh` now runs
`prisma migrate resolve --rolled-back "$PRISMA_RESOLVE_ROLLED_BACK"`
before `migrate deploy`, only when that env var is set, with `|| echo
...` (not bare, so `set -e` doesn't treat it as fatal) around it so a
"nothing to resolve" result — the normal case once the one bad migration
is cleared — never fails the build. `migrate deploy` itself runs
undecorated (no output capture/piping) so a real failure's full Prisma
error text reaches the Vercel build log verbatim. Verified all three
paths (no env var set / resolve has nothing to do / deploy genuinely
fails) with a stubbed `prisma` binary before pushing, since this sandbox
still has no real Supabase connection to test against directly.

Value to set in Vercel: `PRISMA_RESOLVE_ROLLED_BACK=20260920221259_init`
(the exact migration name from the P3009 error). Safe to leave set
permanently — once resolved, later runs just hit the harmless "nothing to
resolve" branch — but fine to remove again once a build succeeds, since
its only job is clearing this one incident.

## Backend build: API routes, DB wiring, Vercel migrate/seed (2026-09-21)

### Step 1 (DB) blocked, then descoped for this pass
`DATABASE_URL`/`DIRECT_URL` are not set in this sandbox at all (not just
empty — absent from the environment and no `.env` file exists). Confirmed
by running `prisma migrate deploy` directly: it fails before touching the
network, at schema validation —

```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DIRECT_URL.
```

Per instruction, `migrate deploy` and `db seed` were not run here. Row
Level Security was already handled in an earlier commit on this branch
(migration `20260920221304_enable_row_level_security`, all 9 tables, no
policies) — nothing new was needed for that part once a real DB connects.
Given the CLI here has no path to Supabase, the user asked to proceed with
the API/wiring work regardless and to make migrations + seeding runnable
from Vercel instead, where the real env vars live. See README (once
updated) / the PR description for the exact Vercel setup steps.

### `lib/prisma.ts`
Standard Next.js singleton (`globalThis`-cached `PrismaClient`), so dev's
module hot-reloading doesn't open a new connection pool per edit.

### Query helpers instead of routes calling routes
Server Components (`/events`, `/events/[slug]`, `/passport/[token]`) query
Prisma directly through shared helpers in `lib/events-db.ts` and
`lib/passport-db.ts`, rather than `fetch`-ing this app's own API routes —
the routes exist because the brief asked for them (and they're useful for
any future non-Next client), but a server component calling its own HTTP
API over the network would be a pointless round trip. Both the pages and
the route handlers import the same helpers, so the query and
derived-field logic (`homesCount`, `hostingBrokerages`, reward-tier
parsing, date-label formatting) isn't duplicated.

### `scanToken` is never returned by a JSON API
`GET /api/events/[slug]` lists an event's stops but omits each stop's
`scanToken`, and `GET /api/passport/[token]` only exposes a `stamped`
boolean per stop, never the token. A stop's `scanToken` is the credential
that stamps it — the whole scavenger-hunt mechanic depends on it only
being reachable by physically scanning the QR code at that stop. Putting
it in a public JSON response would let anyone stamp any pass for any stop
remotely, with no visit required. (The `/s/[scanToken]` QR landing page
that actually consumes it is still Phase 3/4, per the existing Phase 1
entry below.)

### RSVP → consent-gated lead forwarding
`POST /api/rsvp` upserts the Attendee (by email) and the Pass (unique on
`attendeeId`+`eventId`, so re-RSVPing to the same event updates the
existing pass instead of erroring or duplicating), storing
`agentContactConsent`, `consentedAt` (`null` unless consent is `true`),
and the exact `consentText` shown (`lib/site-config.ts`'s `CONSENT_TEXT`)
— per product rule 1. `LeadDelivery` rows (one per unique agent behind the
event's `LISTING` stops) are created **only** when
`agentContactConsent === true`; with no consent, zero `LeadDelivery` rows
exist for that pass, so there is nothing for any future dispatcher to
send. Actually delivering a lead (calling an `Agent.crmWebhookUrl`) is out
of scope here — this pass only creates the `PENDING` record consent
gates.

Pass tokens use `crypto.randomUUID()` (product rule 6: unguessable,
non-sequential).

### `POST /api/stamps/scan`: idempotent + rate-limited
Idempotent via a `findUnique` check before create on the
`passId_stopId` unique constraint (returns `alreadyStamped: true` instead
of erroring on a repeat scan), with a create-then-catch-P2002 fallback for
the race where two requests hit at once. Rate limiting
(`lib/rate-limit.ts`) is an in-memory fixed window keyed on
`ip:passToken`, which is a real limitation: it's per-instance and resets
on cold start, so it won't hold a limit across multiple concurrent Vercel
instances. Flagging this rather than pretending it's production-grade —
swapping in a shared store (e.g. Upstash Redis) is the fix if this needs
to be tight at scale.

### `Event.state` isn't a DB column
`lib/seed-data.ts`'s `SeedEvent` shape carries a `state` field (all `"TX"`
placeholder data), but the Prisma `Event` model never had one — only
`neighborhood`/`city`. Rather than add a column for this pass, the event
detail page's location line was changed from `{neighborhood} · {city},
{state}` to `{neighborhood} · {city}`. Flagging in case `state` should
become a real column later (e.g. once markets outside Texas exist).

### Pages need `export const dynamic = "force-dynamic"`
This Next.js version's default caching model (Cache Components is opt-in
via `cacheComponents: true` in `next.config.ts`, not set here) will still
attempt to statically prerender a page at build time unless told
otherwise, even one that's just an async Server Component doing a Prisma
call with no `fetch`. Without `DATABASE_URL`, that prerender attempt would
throw during `next build`. `/events`, `/events/[slug]`, and
`/passport/[token]` (all DB-backed, all meant to be fresh per request
anyway — no login, live stamp/RSVP data) now export
`dynamic = "force-dynamic"`, and `/events/[slug]`'s old
`generateStaticParams` (which read `lib/seed-data.ts`) was removed.
Verified by running `npm run build` in this sandbox with no
`DATABASE_URL`/`DIRECT_URL` set at all — it completes, and the route
summary correctly marks those three plus all `/api/*` routes as `ƒ`
(server-rendered on demand) rather than trying to prerender them. `/` and
`/agents` stay static since neither touches the DB.

### Vercel: migrations + build-time seed (superseded, see below)
Added a `vercel-build` script running `prisma generate && prisma migrate
deploy && next build`, alongside the existing `build` script (unchanged,
so local/CI builds without DB credentials still work — verified above),
plus a `POST /api/admin/seed` endpoint (secret-gated via `SEED_SECRET`)
as a way to trigger the already-idempotent `prisma/seed-runner.ts` once
Vercel had real DB credentials. Replaced by the simpler build-time-flag
approach below at the user's request, since they can't run terminal
commands (e.g. `curl`) to hit an endpoint after deploy.

### Simplified: `SEED_ON_BUILD` flag instead of an admin endpoint (2026-09-21)
Removed `POST /api/admin/seed` and `SEED_SECRET` entirely — no endpoint,
no secret to manage. `vercel-build` is now `sh scripts/vercel-build.sh`,
which runs `prisma generate`, `prisma migrate deploy`, then `npm run
db:seed` **only** when the `SEED_ON_BUILD` env var is exactly the string
`"true"`, then `next build`. `prisma/seed-runner.ts` was already built
entirely out of upserts (or an existence check before create), keyed on
each table's natural unique field, so it's safe to leave
`SEED_ON_BUILD=true` set permanently in Vercel — every build re-applies
the same placeholder rows rather than duplicating them, and non-placeholder
rows (real attendees, real stamps) are untouched since the seed only ever
touches the fixed set of keys in `lib/seed-data.ts`. A shell script (vs.
inlining the conditional in `package.json`) so the seed step's own
failure still fails the build (`set -e`), rather than a one-liner's
`||`-based skip-logic accidentally swallowing a real seed error along
with the "flag not set" case.

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
