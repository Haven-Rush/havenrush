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

## Other scripts

```bash
npm run lint          # eslint
npm run build         # production build
npm run db:migrate:dev  # prisma migrate dev (local schema iteration)
npm run db:studio     # prisma studio (browse the DB)
```

## Notes

- `lib/seed-data.ts` is the plain-file seed data used directly by Phase 1's
  static pages; `prisma/seed.ts` loads the same data into Postgres for
  Phase 2+.
- Every table has Row Level Security enabled with no policies (migration
  `20260920221304_enable_row_level_security`), so Supabase's PostgREST/GraphQL
  API can't read or write anything — the app talks to Postgres directly via
  Prisma. See `DECISIONS.md`.
