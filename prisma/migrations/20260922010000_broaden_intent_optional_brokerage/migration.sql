-- Place-discovery repositioning: an RSVP shouldn't force every attendee,
-- regardless of event category, to declare they're "Buying" or "Renting"
-- real estate. Add a neutral third option.
--
-- Note: this file must not reference the new 'EXPLORING' value anywhere
-- else (e.g. in an UPDATE), since Postgres doesn't allow a freshly added
-- enum value to be used within the same transaction it was added in.
ALTER TYPE "Intent" ADD VALUE 'EXPLORING';

-- The /agents inquiry form promises non-real-estate hosts (coworking,
-- hotels, venues) "no listing required", but brokerage was a required
-- field on both the form and this column. Make it optional.
ALTER TABLE "AgentInquiry" ALTER COLUMN "brokerage" DROP NOT NULL;
