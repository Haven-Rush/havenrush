# Haven Rush

Event marketing platform — see `CLAUDE.md` for the project brief and
`docs/` for brand and business-plan reference material.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma, on Postgres via
[Supabase](https://supabase.com) (same database for local dev and
production — see `DECISIONS.md`). Hosted on Vercel.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` from your Supabase project's **Project Settings → Database →
Connection string**:
- `DATABASE_URL` — the **Transaction pooler** connection string (port 6543).
  This is what the app uses at runtime.
- `DIRECT_URL` — the **direct connection** string (port 5432, `db.<project-ref>.supabase.co`).
  This is only used by Prisma Migrate.

Then apply migrations and seed placeholder data:

```bash
npm run db:migrate   # prisma migrate deploy
npm run db:seed      # prisma db seed
```

Run the app:

```bash
npm run dev
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Home |
| `/events` | Events feed |
| `/events/[slug]` | Event detail + RSVP |
| `/passport/[token]` | Mobile passport |
| `/agents` | For Agents & Hosts |
| `/s/[scanToken]` | QR scan landing (arrives with the scan flow, Phase 3/4) |

## API routes

| Route | Purpose |
|---|---|
| `GET /api/events` | List events |
| `GET /api/events/[slug]` | Event detail |
| `POST /api/rsvp` | RSVP: email required, name optional, unchecked-by-default agent-contact consent |
| `GET /api/passport/[token]` | Passport state for a pass token |
| `POST /api/stamps/scan` | Stamp a stop (idempotent, rate-limited) |
| `POST /api/agent-inquiries` | `/agents` "Request Info" form submissions |

## Other scripts

```bash
npm run lint          # eslint
npm run build         # production build (no DB access needed — see below)
npm run vercel-build  # scripts/vercel-build.sh — see "Deploying to Vercel"
npm run db:migrate:dev  # prisma migrate dev (local schema iteration)
npm run db:studio     # prisma studio (browse the DB)
```

## Deploying to Vercel

The app's pages and API routes are all DB-backed and dynamically rendered
(no data is baked in at build time), so `npm run build` succeeds even
without `DATABASE_URL`/`DIRECT_URL` set — but Vercel still needs both, plus
a couple of one-time setup steps:

1. **Project Settings → Environment Variables**: add `DATABASE_URL` and
   `DIRECT_URL` (from Supabase, see **Setup** above). Optionally add
   `SEED_ON_BUILD="true"` to also seed placeholder data on every build —
   the seed is idempotent (`prisma/seed-runner.ts` is all upserts), so
   this is safe to leave on permanently rather than needing a one-time
   trigger.
2. **Project Settings → Build & Development Settings → Build Command**:
   override it to `npm run vercel-build`. This runs
   `prisma generate && prisma migrate deploy`, then the seed if
   `SEED_ON_BUILD=true`, then `next build` — see `scripts/vercel-build.sh`.
   Schema migrations then ship automatically on every deploy; you should
   not need to run `prisma migrate deploy` by hand against production.

## Notes

- `lib/seed-data.ts` is placeholder data used only as seed input
  (`prisma/seed-runner.ts`, shared by `prisma/seed.ts` and
  `scripts/vercel-build.sh`) — every page reads from Postgres via Prisma
  (`lib/events-db.ts`, `lib/passport-db.ts`), not from this file.
- Every table has Row Level Security enabled with no policies (migration
  `20260920221304_enable_row_level_security`), so Supabase's PostgREST/GraphQL
  API can't read or write anything — the app talks to Postgres directly via
  Prisma. See `DECISIONS.md`.
