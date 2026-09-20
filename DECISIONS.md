# Decisions & assumptions

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
