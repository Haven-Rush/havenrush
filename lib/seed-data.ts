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
    id: "evt-south-congress-crawl",
    slug: "south-congress-tasting-crawl",
    title: "South Congress Tasting Crawl",
    type: "HOME_CRAWL",
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
    id: "evt-austin-housing-fair",
    slug: "austin-housing-fair",
    title: "Austin Housing Fair",
    type: "HOME_FAIR",
    neighborhood: "Downtown",
    city: "Austin",
    state: "TX",
    startsAt: "2026-11-07T10:00:00-06:00",
    endsAt: "2026-11-08T17:00:00-06:00",
    dateLabel: "Nov 7–8 · Downtown Expo Center",
    description:
      "A two-day housing expo bringing agents, builders, lenders, and local home-service businesses together in one space, with talks, tastings, and a kids' zone.",
    rewardTiers: [
      { stops: 5, reward: "Expo tote bag" },
      { stops: 10, reward: "Prize drawing entry" },
    ],
    sponsors: [
      { id: "spn-lonestar-lending", name: "Lonestar Lending", role: "Presenting sponsor" },
      { id: "spn-capital-title", name: "Capital Title", role: "Category sponsor" },
    ],
    stops: [
      {
        id: "stop-ah-1",
        order: 1,
        kind: "VENDOR",
        name: "Lonestar Lending Booth",
        address: "500 E Cesar Chavez St, Austin, TX",
        scanToken: "ah1-c2fq88",
      },
      {
        id: "stop-ah-2",
        order: 2,
        kind: "VENDOR",
        name: "Capital Title Booth",
        address: "500 E Cesar Chavez St, Austin, TX",
        scanToken: "ah2-h7ls33",
      },
      {
        id: "stop-ah-3",
        order: 3,
        kind: "COFFEE",
        name: "Expo Center Coffee Bar",
        address: "500 E Cesar Chavez St, Austin, TX",
        scanToken: "ah3-j1tv60",
      },
    ],
  },
  {
    id: "evt-hyde-park-porch-crawl",
    slug: "hyde-park-porch-crawl",
    title: "Hyde Park Porch Crawl",
    type: "HOME_CRAWL",
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
    eventSlug: "south-congress-tasting-crawl",
    attendeeName: "Jordan",
    intent: "BUYING",
    timeline: "JUST_LOOKING",
    stampedStopIds: ["stop-sc-1", "stop-sc-2"],
  },
];

export function getPassByToken(token: string): SeedPass | undefined {
  return SEED_PASSES.find((pass) => pass.token === token);
}
