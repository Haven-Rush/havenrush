/**
 * Canonical event-type vocabulary. Change labels/copy here only — every
 * page reads from this file instead of hardcoding strings.
 *
 * Naming note: HOME_HUNT was previously "Home Crawl" in the mockup UI; the
 * brand doc and business plan always called it "Home Hunt". We now follow
 * the brand doc's label everywhere (see DECISIONS.md).
 */
export const EVENT_TYPES = {
  HOUSE_PARTY: {
    label: "House Party",
    tagline: "One home. Local coffee. Live music. Good company.",
  },
  HOME_HUNT: {
    label: "Home Hunt",
    tagline: "Walk a handful of homes in an afternoon, with local food stops along the way.",
  },
  OPEN_HOUSE_WEEKEND: {
    label: "Open House Weekend",
    tagline: "A whole weekend, homes across town, one passport. Go at your own pace and collect stamps.",
  },
  HOME_FAIR: {
    label: "Home Fair",
    tagline:
      "A builder's new neighborhood, opened up like a market. Tour model homes, meet local makers, and collect stamps.",
  },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

// Order also drives the home page: everything but HOME_FAIR gets a main
// card; HOME_FAIR gets its own smaller "For builders" card (see
// app/(site)/page.tsx).
export const EVENT_TYPE_ORDER: EventType[] = [
  "HOUSE_PARTY",
  "HOME_HUNT",
  "OPEN_HOUSE_WEEKEND",
  "HOME_FAIR",
];

export const STOP_KINDS = {
  LISTING: { label: "Home" },
  COFFEE: { label: "Coffee stop" },
  FOOD: { label: "Food stop" },
  MUSIC: { label: "Live music" },
  VENDOR: { label: "Local vendor" },
} as const;

export type StopKind = keyof typeof STOP_KINDS;

/**
 * The real estate purpose every event must state (CLAUDE.md product rule:
 * "Every event must have a stated real estate purpose") -- what the event
 * is marketing the property for, separate from EVENT_TYPES (its format).
 */
export const EVENT_PURPOSES = {
  SALE: { label: "For Sale" },
  RENTAL: { label: "For Rent" },
  LEASE: { label: "Leasing" },
  SHOWCASE: { label: "Showcase" },
} as const;

export type EventPurpose = keyof typeof EVENT_PURPOSES;

export const EVENT_PURPOSE_ORDER: EventPurpose[] = ["SALE", "RENTAL", "LEASE", "SHOWCASE"];
