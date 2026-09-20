-- Remove HOME_FAIR from EventType, replaced by OPEN_HOUSE_WEEKEND.
--
-- Postgres has no direct "DROP VALUE" for enums, so we: migrate any
-- existing HOME_FAIR rows to OPEN_HOUSE_WEEKEND first (while the column
-- still uses the old enum, which has both values), then swap the column
-- to a freshly created enum that no longer has HOME_FAIR at all.

UPDATE "Event" SET "type" = 'OPEN_HOUSE_WEEKEND' WHERE "type" = 'HOME_FAIR';

ALTER TYPE "EventType" RENAME TO "EventType_old";
CREATE TYPE "EventType" AS ENUM ('HOUSE_PARTY', 'HOME_CRAWL', 'OPEN_HOUSE_WEEKEND');
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "EventType" USING ("type"::text::"EventType");
DROP TYPE "EventType_old";
