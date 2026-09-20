-- Enable Row Level Security on every application table, with no policies.
--
-- Supabase auto-exposes every table in the `public` schema through its
-- PostgREST (REST) and GraphQL APIs to the `anon`/`authenticated` roles.
-- This app never uses those APIs — it talks to Postgres directly via
-- Prisma over DATABASE_URL/DIRECT_URL, using the `postgres` role, which
-- has BYPASSRLS on Supabase projects by default. Enabling RLS with zero
-- policies means: Prisma (bypasses RLS) keeps working exactly as before,
-- while the anon/authenticated roles get a default-deny on every table —
-- most importantly Attendee, Pass, and Stamp, which hold personal data
-- and consent records that must never be reachable from the public API
-- surface.
ALTER TABLE "Attendee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sponsor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pass" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stamp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentInquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadDelivery" ENABLE ROW LEVEL SECURITY;
