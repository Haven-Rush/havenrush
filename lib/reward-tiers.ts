/**
 * `Event.rewardTiers` is stored as Prisma `Json` (see prisma/schema.prisma)
 * since Postgres has no native "array of {stops,reward} objects" column
 * type worth modeling as its own table for a handful of tiers per event.
 */
export type RewardTier = {
  stops: number;
  reward: string;
};

export function parseRewardTiers(value: unknown): RewardTier[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tier): tier is RewardTier => {
    if (typeof tier !== "object" || tier === null) return false;
    const candidate = tier as Record<string, unknown>;
    return typeof candidate.stops === "number" && typeof candidate.reward === "string";
  });
}
