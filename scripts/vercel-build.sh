#!/bin/sh
# Vercel's build command (see README.md "Deploying to Vercel"). Runs with
# DATABASE_URL/DIRECT_URL set (Vercel env vars), unlike local/CI `next
# build`, which has neither and must not depend on them.
set -e

prisma generate
prisma migrate deploy

if [ "$SEED_ON_BUILD" = "true" ]; then
  echo "SEED_ON_BUILD=true — running seed (idempotent, safe on every deploy)"
  npm run db:seed
fi

next build
