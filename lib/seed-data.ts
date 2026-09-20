import type { EventType, StopKind } from "./event-types";

/**
 * Placeholder seed data (Phase 1, no database yet — see CLAUDE.md Phase 2).
 * Austin/South Congress/Bouldin Creek/Hyde Park are placeholder city &
 * neighborhood data, not hardcoded UI copy — swap this file for a real
 * market without touching any page.
 */

export type Stop = {
  id: string;
  order: number;
  kind: StopKind;
  name: string;
  address: string;
  brokerage?: string;
  agentName?: string;
  scanToken: string;
};

export type Sponsor = {
  id: string;
  name: string;
  role: string;
};

export type RewardTier = {
  stops: number;
  reward: string;
};

export type SeedEvent = {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  neighborhood: string;
  city: string;
  state: string;
  startsAt: string;
  endsAt: string;
  dateLabel: string;
  description: string;
  rewardTiers: RewardTier[];
  stops: Stop[];
  sponsors: Sponsor[];
};

export const EVENTS: SeedEvent[] = [
  {
    id: "evt-south-congress-hunt",
    slug: "south-congress-tasting-hunt",
    title: "South Congress Tasting Hunt",
    type: "HOME_HUNT",
    neighborhood: "South Congress",
    city: "Austin",
    state: "TX",
    startsAt: "2026-10-24T15:00:00-05:00",
    endsAt: "2026-10-24T19:00:00-05:00",
    dateLabel: "Sat, Oct 24 · South Congress, Austin",
    description:
      "Walk South Congress at your own pace: five homes, a coffee stop, two food stops, live music, and a local design pop-up. Scan in at each stop to fill your passport and unlock rewards.",
    rewardTiers: [
      { stops: 3, reward: "Free coffee" },
      { stops: 6, reward: "Prize drawing entry" },
      { stops: 10, reward: "Grand prize entry" },
    ],
    sponsors: [
      { id: "spn-houndstooth", name: "Houndstooth Coffee", role: "Coffee sponsor" },
      { id: "spn-abc-title", name: "ABC Title Co.", role: "Presenting sponsor" },
    ],
    stops: [
      {
        id: "stop-sc-1",
        order: 1,
        kind: "LISTING",
        name: "1204 Newning Ave",
        address: "1204 Newning Ave, Austin, TX",
        brokerage: "South Congress Realty",
        agentName: "Priya Anand",
        scanToken: "sc1-8f2kq9",
      },
      {
        id: "stop-sc-2",
        order: 2,
        kind: "COFFEE",
        name: "1408 Elizabeth St",
        address: "1408 Elizabeth St, Austin, TX",
        scanToken: "sc2-m4vr71",
      },
      {
        id: "stop-sc-3",
        order: 3,
        kind: "LISTING",
        name: "1611 Kinney Ave",
        address: "1611 Kinney Ave, Austin, TX",
        brokerage: "South Congress Realty",
        agentName: "Priya Anand",
        scanToken: "sc3-t9xh24",
      },
      {
        id: "stop-sc-4",
        order: 4,
        kind: "FOOD",
        name: "1802 S 1st Street",
        address: "1802 S 1st St, Austin, TX",
        scanToken: "sc4-w1jp56",
      },
      {
        id: "stop-sc-5",
        order: 5,
        kind: "LISTING",
        name: "2105 Alameda Dr",
        address: "2105 Alameda Dr, Austin, TX",
        brokerage: "Bouldin Creek Properties",
        agentName: "Marcus Ferreira",
        scanToken: "sc5-q7dn83",
      },
      {
        id: "stop-sc-6",
        order: 6,
        kind: "MUSIC",
        name: "South Congress Park",
        address: "1600 S Congress Ave, Austin, TX",
        scanToken: "sc6-z3lk90",
      },
      {
        id: "stop-sc-7",
        order: 7,
        kind: "LISTING",
        name: "1307 Newning Ave",
        address: "1307 Newning Ave, Austin, TX",
        brokerage: "South Congress Realty",
        agentName: "Priya Anand",
        scanToken: "sc7-b6fy45",
      },
      {
        id: "stop-sc-8",
        order: 8,
        kind: "FOOD",
        name: "1500 S Congress Ave",
        address: "1500 S Congress Ave, Austin, TX",
        scanToken: "sc8-n2ct18",
      },
      {
        id: "stop-sc-9",
        order: 9,
        kind: "LISTING",
        name: "1902 Fulmore St",
        address: "1902 Fulmore St, Austin, TX",
        brokerage: "Bouldin Creek Properties",
        agentName: "Marcus Ferreira",
        scanToken: "sc9-r5gw62",
      },
      {
        id: "stop-sc-10",
        order: 10,
        kind: "VENDOR",
        name: "South Congress Design Co.",
        address: "1420 S Congress Ave, Austin, TX",
        scanToken: "sc10-y8hs37",
      },
    ],
  },
  {
    id: "evt-elizabeth-st-social",
    slug: "elizabeth-st-social",
    title: "The Elizabeth St Social",
    type: "HOUSE_PARTY",
    neighborhood: "Bouldin Creek",
    city: "Austin",
    state: "TX",
    startsAt: "2026-10-25T16:00:00-05:00",
    endsAt: "2026-10-25T19:00:00-05:00",
    dateLabel: "Sun, Oct 25 · Bouldin Creek",
    description:
      "One home, one neighborhood, one afternoon: local coffee, an acoustic set on the porch, and a chance to meet the block before you meet the listing.",
    rewardTiers: [{ stops: 1, reward: "Free coffee" }],
    sponsors: [{ id: "spn-jos-coffee", name: "Jo's Coffee", role: "Coffee sponsor" }],
    stops: [
      {
        id: "stop-es-1",
        order: 1,
        kind: "LISTING",
        name: "1719 Elizabeth St",
        address: "1719 Elizabeth St, Austin, TX",
        brokerage: "Bouldin Creek Properties",
        agentName: "Marcus Ferreira",
        scanToken: "es1-k4wm71",
      },
      {
        id: "stop-es-2",
        order: 2,
        kind: "MUSIC",
        name: "Front Porch Stage",
        address: "1719 Elizabeth St, Austin, TX",
        scanToken: "es2-p9dv02",
      },
    ],
  },
  {
    id: "evt-austin-open-house-weekend",
    slug: "austin-open-house-weekend",
    title: "Austin Open House Weekend",
    type: "OPEN_HOUSE_WEEKEND",
    neighborhood: "Citywide",
    city: "Austin",
    state: "TX",
    startsAt: "2026-11-07T10:00:00-06:00",
    endsAt: "2026-11-08T17:00:00-06:00",
    dateLabel: "Nov 7–8 · Citywide",
    description:
      "A weekend-long, citywide open house: visit participating homes across Austin at your own pace, scan in at each one, and fill your passport for prizes.",
    rewardTiers: [
      { stops: 3, reward: "Weekend tote bag" },
      { stops: 5, reward: "Prize drawing entry" },
    ],
    sponsors: [
      { id: "spn-lonestar-lending", name: "Lonestar Lending", role: "Presenting sponsor" },
      { id: "spn-capital-title", name: "Capital Title", role: "Category sponsor" },
    ],
    stops: [
      {
        id: "stop-oh-1",
        order: 1,
        kind: "LISTING",
        name: "1305 Newning Ave",
        address: "1305 Newning Ave, Austin, TX",
        brokerage: "South Congress Realty",
        agentName: "Priya Anand",
        scanToken: "oh1-f3kn72",
      },
      {
        id: "stop-oh-2",
        order: 2,
        kind: "LISTING",
        name: "1810 Elizabeth St",
        address: "1810 Elizabeth St, Austin, TX",
        brokerage: "Bouldin Creek Properties",
        agentName: "Marcus Ferreira",
        scanToken: "oh2-l9wp05",
      },
      {
        id: "stop-oh-3",
        order: 3,
        kind: "LISTING",
        name: "4106 Avenue F",
        address: "4106 Avenue F, Austin, TX",
        brokerage: "Hyde Park Home Collective",
        agentName: "Renee Okafor",
        scanToken: "oh3-d6mv41",
      },
      {
        id: "stop-oh-4",
        order: 4,
        kind: "LISTING",
        name: "1200 Sunset Lane",
        address: "1200 Sunset Lane, Austin, TX",
        brokerage: "Zilker Realty Group",
        agentName: "Diego Salazar",
        scanToken: "oh4-t8rc93",
      },
      {
        id: "stop-oh-5",
        order: 5,
        kind: "LISTING",
        name: "2110 Alta Vista Ave",
        address: "2110 Alta Vista Ave, Austin, TX",
        brokerage: "Travis Heights Realty",
        agentName: "Elena Cho",
        scanToken: "oh5-y2qb60",
      },
    ],
  },
  {
    id: "evt-hyde-park-porch-hunt",
    slug: "hyde-park-porch-hunt",
    title: "Hyde Park Porch Hunt",
    type: "HOME_HUNT",
    neighborhood: "Hyde Park",
    city: "Austin",
    state: "TX",
    startsAt: "2026-11-21T15:00:00-06:00",
    endsAt: "2026-11-21T18:00:00-06:00",
    dateLabel: "Nov 21 · Hyde Park",
    description:
      "A porch-to-porch afternoon through Hyde Park's bungalows, with a coffee stop and a local bakery pop-up along the way.",
    rewardTiers: [{ stops: 3, reward: "Free coffee" }],
    sponsors: [{ id: "spn-quacks", name: "Quack's Bakery", role: "Food sponsor" }],
    stops: [
      {
        id: "stop-hp-1",
        order: 1,
        kind: "LISTING",
        name: "4210 Avenue G",
        address: "4210 Avenue G, Austin, TX",
        brokerage: "Hyde Park Home Collective",
        agentName: "Renee Okafor",
        scanToken: "hp1-x5bn14",
      },
      {
        id: "stop-hp-2",
        order: 2,
        kind: "FOOD",
        name: "Quack's Bakery Pop-Up",
        address: "411 E 43rd St, Austin, TX",
        scanToken: "hp2-d8mz29",
      },
      {
        id: "stop-hp-3",
        order: 3,
        kind: "LISTING",
        name: "3908 Speedway",
        address: "3908 Speedway, Austin, TX",
        brokerage: "Hyde Park Home Collective",
        agentName: "Renee Okafor",
        scanToken: "hp3-v0ry47",
      },
    ],
  },
  {
    // Placeholder per CLAUDE.md's suggested seed: "Sunday Market at Willow
    // Creek · Nov 7-8 · New neighborhood" — rename later. Willow Creek is a
    // fictional new-construction community (not an existing Austin
    // neighborhood), matching the Home Fair concept: a builder opening its
    // community like a market day.
    id: "evt-willow-creek-market",
    slug: "sunday-market-at-willow-creek",
    title: "Sunday Market at Willow Creek",
    type: "HOME_FAIR",
    neighborhood: "New neighborhood",
    city: "Austin",
    state: "TX",
    startsAt: "2026-11-07T10:00:00-06:00",
    endsAt: "2026-11-08T16:00:00-06:00",
    dateLabel: "Nov 7–8 · New neighborhood",
    description:
      "Willow Creek opens its new community like a market day: tour model homes, meet local makers, and grab a bite from the food trucks, with live music and lender, designer, and mover booths on hand. Scan in at each stop to fill your passport.",
    rewardTiers: [
      { stops: 3, reward: "Free coffee" },
      { stops: 6, reward: "Prize drawing entry" },
    ],
    sponsors: [{ id: "spn-texas-title", name: "Texas Title Co.", role: "Presenting sponsor" }],
    stops: [
      {
        id: "stop-wc-1",
        order: 1,
        kind: "LISTING",
        name: "Model Home — The Aldrich",
        address: "100 Willow Creek Way, Austin, TX",
        brokerage: "Vantage Homes",
        agentName: "On-site sales team",
        scanToken: "wc1-a4jf80",
      },
      {
        id: "stop-wc-2",
        order: 2,
        kind: "LISTING",
        name: "Model Home — The Barbara",
        address: "104 Willow Creek Way, Austin, TX",
        brokerage: "Meritage Homes",
        agentName: "On-site sales team",
        scanToken: "wc2-e7ks35",
      },
      {
        id: "stop-wc-3",
        order: 3,
        kind: "LISTING",
        name: "Model Home — The Zach",
        address: "108 Willow Creek Way, Austin, TX",
        brokerage: "David Weekley Homes",
        agentName: "On-site sales team",
        scanToken: "wc3-p1zx64",
      },
      {
        id: "stop-wc-4",
        order: 4,
        kind: "VENDOR",
        name: "Hill Country Mortgage Booth",
        address: "Willow Creek Community Center, Austin, TX",
        scanToken: "wc4-h6bq52",
      },
      {
        id: "stop-wc-5",
        order: 5,
        kind: "VENDOR",
        name: "Willow & Oak Design Studio Booth",
        address: "Willow Creek Community Center, Austin, TX",
        scanToken: "wc5-n3fw94",
      },
      {
        id: "stop-wc-6",
        order: 6,
        kind: "VENDOR",
        name: "TwoMen Moving Co. Booth",
        address: "Willow Creek Community Center, Austin, TX",
        scanToken: "wc6-t8kd11",
      },
      {
        id: "stop-wc-7",
        order: 7,
        kind: "MUSIC",
        name: "Market Day Stage",
        address: "Willow Creek Green, Austin, TX",
        scanToken: "wc7-m5vy76",
      },
      {
        id: "stop-wc-8",
        order: 8,
        kind: "COFFEE",
        name: "Willow Creek Coffee Cart",
        address: "Willow Creek Green, Austin, TX",
        scanToken: "wc8-c2rx40",
      },
      {
        id: "stop-wc-9",
        order: 9,
        kind: "FOOD",
        name: "Willow Creek Makers Market",
        address: "Willow Creek Green, Austin, TX",
        scanToken: "wc9-f9qz28",
      },
    ],
  },
];

export function getEventBySlug(slug: string): SeedEvent | undefined {
  return EVENTS.find((event) => event.slug === slug);
}

export function homesCount(event: SeedEvent): number {
  return event.stops.filter((stop) => stop.kind === "LISTING").length;
}

export function tastingStopsCount(event: SeedEvent): number {
  return event.stops.filter((stop) => stop.kind === "COFFEE" || stop.kind === "FOOD").length;
}

export function hostingBrokerages(event: SeedEvent): string[] {
  const names = event.stops
    .filter((stop) => stop.kind === "LISTING" && stop.brokerage)
    .map((stop) => stop.brokerage as string);
  return Array.from(new Set(names));
}

export function topReward(event: SeedEvent): string | undefined {
  if (event.rewardTiers.length === 0) return undefined;
  return event.rewardTiers[0].reward;
}

/**
 * Demo passport (Phase 1 placeholder). In Phase 2+ this comes from the
 * Pass/Stamp tables via /api/passport/:token; the shape here matches what
 * that endpoint will return so the page component doesn't need to change.
 */
export type SeedPass = {
  token: string;
  eventSlug: string;
  attendeeName: string;
  intent: "BUYING" | "RENTING";
  timeline: "JUST_LOOKING" | "MOVING_SOON";
  stampedStopIds: string[];
};

export const SEED_PASSES: SeedPass[] = [
  {
    token: "demo-pass-a1b2c3d4",
    eventSlug: "south-congress-tasting-hunt",
    attendeeName: "Jordan",
    intent: "BUYING",
    timeline: "JUST_LOOKING",
    stampedStopIds: ["stop-sc-1", "stop-sc-2"],
  },
];

export function getPassByToken(token: string): SeedPass | undefined {
  return SEED_PASSES.find((pass) => pass.token === token);
}
