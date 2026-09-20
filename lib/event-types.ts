/**
 * Canonical event-type vocabulary. Change labels/copy here only — every
 * page reads from this file instead of hardcoding strings.
 *
 * Naming note: the brand doc and business plan call HOME_CRAWL "Home Hunt".
 * The mockup UI says "Home Crawl". We follow the mockup's UI label.
 */
export const EVENT_TYPES = {
  HOUSE_PARTY: {
    label: "House Party",
    tagline: "One home. Local coffee. Live music. Good company.",
  },
  HOME_CRAWL: {
    label: "Home Crawl",
    tagline: "Walk a handful of homes in an afternoon, with local food stops along the way.",
  },
  HOME_FAIR: {
    label: "Home Fair",
    tagline: "Local builders, designers, and coffee roasters, all in one space.",
  },
  OPEN_HOUSE_WEEKEND: {
    label: "Open House Weekend",
    tagline: "A weekend of homes across the city, one map, one passport.",
  },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export const EVENT_TYPE_ORDER: EventType[] = [
  "HOUSE_PARTY",
  "HOME_CRAWL",
  "HOME_FAIR",
  "OPEN_HOUSE_WEEKEND",
];

export const STOP_KINDS = {
  LISTING: { label: "Home" },
  COFFEE: { label: "Coffee stop" },
  FOOD: { label: "Food stop" },
  MUSIC: { label: "Live music" },
  VENDOR: { label: "Local vendor" },
} as const;

export type StopKind = keyof typeof STOP_KINDS;
