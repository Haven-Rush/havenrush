#!/bin/sh
# Vercel's build command (see README.md "Deploying to Vercel"). Runs with
# DATABASE_URL/DIRECT_URL set (Vercel env vars), unlike local/CI `next
# build`, which has neither and must not depend on them.
set -e

prisma generate

# One-time recovery knob: if a previous build got killed mid-migration,
# Postgres is left with that migration recorded as "failed" and every
# subsequent `migrate deploy` refuses to proceed (P3009) even though the
# database itself has nothing to roll back (this project's DB is new and
# empty). Set PRISMA_RESOLVE_ROLLED_BACK to that migration's name in
# Vercel to clear it before deploy retries. `|| true` so this never fails
# the build: there being nothing to resolve is the common case once the
# one bad migration has already been cleared.
if [ -n "$PRISMA_RESOLVE_ROLLED_BACK" ]; then
  echo "PRISMA_RESOLVE_ROLLED_BACK is set — resolving migration '$PRISMA_RESOLVE_ROLLED_BACK' as rolled back"
  prisma migrate resolve --rolled-back "$PRISMA_RESOLVE_ROLLED_BACK" || echo "Nothing to resolve for '$PRISMA_RESOLVE_ROLLED_BACK' (or already resolved) — continuing"
fi

# Run unpiped and undecorated so a failure's full Prisma error text (which
# names the offending migration and the exact resolve command to run)
# reaches the Vercel build log verbatim, rather than being summarized or
# truncated by a wrapper.
echo "Running prisma migrate deploy..."
prisma migrate deploy
echo "prisma migrate deploy succeeded"

if [ "$SEED_ON_BUILD" = "true" ]; then
  echo "SEED_ON_BUILD=true — running seed (idempotent, safe on every deploy)"
  npm run db:seed
fi

next build
