-- Add an optional "purpose" field to Event (sale, rental, lease, or
-- showcase). Nullable: real estate is one category a Haven Rush event can
-- serve, not a requirement for every event.
--
-- This migration was never merged/deployed before being corrected to
-- nullable, so it's edited in place rather than layering a second
-- migration on top of a required column nothing has shipped yet.

CREATE TYPE "EventPurpose" AS ENUM ('SALE', 'RENTAL', 'LEASE', 'SHOWCASE');

ALTER TABLE "Event" ADD COLUMN "purpose" "EventPurpose";
