/**
 * Canonical event-type vocabulary. Change labels/copy here only — every
 * page reads from this file instead of hardcoding strings.
 *
 * Naming note: these were House Party / Home Hunt / Open House Weekend /
 * Home Fair. Renamed to Gather / Hunt / Explore / Market -- short,
 * distinct verbs/nouns with no repeated prefix, none of them real-estate-
 * specific on their own (see CLAUDE.md "Vocabulary" and DECISIONS.md).
 */
export const EVENT_TYPES = {
  GATHER: {
    label: "Gather",
    tagline: "One property. Local coffee. Live music. Good company.",
  },
  HUNT: {
    label: "Hunt",
    tagline: "Walk a handful of places in an afternoon, with local food stops along the way.",
  },
  EXPLORE: {
    label: "Explore",
    tagline:
      "A whole weekend, places across town, one passport. Go at your own pace and collect stamps.",
  },
  MARKET: {
    label: "Market",
    tagline:
      "A builder's new neighborhood, opened up like a market. Tour model spaces, meet local makers, and collect stamps.",
  },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

// Order also drives the home page: everything but MARKET gets a main
// card; MARKET gets its own smaller "For builders" card (see
// app/(site)/page.tsx).
export const EVENT_TYPE_ORDER: EventType[] = ["GATHER", "HUNT", "EXPLORE", "MARKET"];

export const STOP_KINDS = {
  LISTING: { label: "Place" },
  COFFEE: { label: "Coffee stop" },
  FOOD: { label: "Food stop" },
  MUSIC: { label: "Live music" },
  VENDOR: { label: "Local vendor" },
} as const;

export type StopKind = keyof typeof STOP_KINDS;

/**
 * The optional real estate purpose an event can state (CLAUDE.md product
 * rule: "Purpose is optional, not required") -- what the event is
 * marketing the property for, separate from EVENT_TYPES (its format).
 */
export const EVENT_PURPOSES = {
  SALE: { label: "For Sale" },
  RENTAL: { label: "For Rent" },
  LEASE: { label: "Leasing" },
  SHOWCASE: { label: "Showcase" },
} as const;

export type EventPurpose = keyof typeof EVENT_PURPOSES;

export const EVENT_PURPOSE_ORDER: EventPurpose[] = ["SALE", "RENTAL", "LEASE", "SHOWCASE"];
