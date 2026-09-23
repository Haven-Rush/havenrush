-- Final naming pass on the four event formats: House Party -> Gather,
-- Home Hunt -> Hunt, Open House Weekend -> Explore, Home Fair -> Market.
-- Same safe technique as 20260921120000_rename_home_crawl_add_home_fair:
-- ALTER TYPE ... RENAME VALUE is a metadata-only change, so every existing
-- row reads as the new value immediately -- no data UPDATE needed for the
-- enum column itself, and this is additive/reversible, never editing a
-- shipped migration file.
ALTER TYPE "EventType" RENAME VALUE 'HOUSE_PARTY' TO 'GATHER';
ALTER TYPE "EventType" RENAME VALUE 'HOME_HUNT' TO 'HUNT';
ALTER TYPE "EventType" RENAME VALUE 'OPEN_HOUSE_WEEKEND' TO 'EXPLORE';
ALTER TYPE "EventType" RENAME VALUE 'HOME_FAIR' TO 'MARKET';

-- The enum rename doesn't touch plain-text columns. One seeded/production
-- event's title literally contained the retired type name ("Open House
-- Weekend"). Fixed here, in the migration itself, rather than depending on
-- SEED_ON_BUILD being set on Vercel to re-run the seed on this deploy --
-- it isn't set by default (see DECISIONS.md), so this is the one path
-- guaranteed to reach production. Guarded on the old title so a manual
-- admin edit already in production isn't silently overwritten.
UPDATE "Event" SET title = 'Austin Explore Weekend'
WHERE slug = 'austin-open-house-weekend' AND title = 'Austin Open House Weekend';
