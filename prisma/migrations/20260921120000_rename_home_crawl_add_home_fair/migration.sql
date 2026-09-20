-- Rename HOME_CRAWL -> HOME_HUNT (renaming an enum value is a metadata-only
-- operation; existing rows automatically read as the new label) and restore
-- HOME_FAIR as a fourth event type. Unlike removing a value, adding one is
-- natively supported by Postgres, so no data migration/enum-rebuild is
-- needed here.
--
-- Note: this file must not reference the new 'HOME_FAIR' value anywhere
-- else (e.g. in an UPDATE), since Postgres doesn't allow a freshly added
-- enum value to be used within the same transaction it was added in.
ALTER TYPE "EventType" RENAME VALUE 'HOME_CRAWL' TO 'HOME_HUNT';
ALTER TYPE "EventType" ADD VALUE 'HOME_FAIR';
