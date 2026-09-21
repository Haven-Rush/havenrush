import { prisma } from "@/lib/prisma";
import { parseRewardTiers, type RewardTier } from "@/lib/reward-tiers";

export function getPassByToken(token: string) {
  return prisma.pass.findUnique({
    where: { token },
    include: {
      event: { include: { stops: { orderBy: { order: "asc" } } } },
      stamps: true,
    },
  });
}

export type PassProgress = {
  stampedCount: number;
  sortedTiers: RewardTier[];
  nextTier?: RewardTier;
  currentReward?: RewardTier;
  progressPct: number;
};

export function computePassProgress(rewardTiersJson: unknown, stampedCount: number): PassProgress {
  const sortedTiers = [...parseRewardTiers(rewardTiersJson)].sort((a, b) => a.stops - b.stops);
  const nextTier = sortedTiers.find((tier) => tier.stops > stampedCount);
  const currentReward = [...sortedTiers].reverse().find((tier) => tier.stops <= stampedCount);
  const progressPct = nextTier ? Math.min(100, Math.round((stampedCount / nextTier.stops) * 100)) : 100;

  return { stampedCount, sortedTiers, nextTier, currentReward, progressPct };
}
