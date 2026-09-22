-- Add a required "purpose" field to Event (CLAUDE.md: every event must
-- state its real estate purpose -- sale, rental, lease, or showcase).
--
-- Existing rows (all sale-oriented placeholder listings at the time this
-- ships) backfill to SALE so the column can become NOT NULL. This backfill
-- is a one-time migration convenience only -- the app itself never
-- defaults to SALE: the admin form requires an explicit selection on
-- every create, and the updated seed data assigns each event's purpose
-- explicitly.

CREATE TYPE "EventPurpose" AS ENUM ('SALE', 'RENTAL', 'LEASE', 'SHOWCASE');

ALTER TABLE "Event" ADD COLUMN "purpose" "EventPurpose";
UPDATE "Event" SET "purpose" = 'SALE' WHERE "purpose" IS NULL;
ALTER TABLE "Event" ALTER COLUMN "purpose" SET NOT NULL;
