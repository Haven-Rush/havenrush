/**
 * Single source for the platform commission rate (CLAUDE.md "Pricing
 * model": "a single configurable value... don't hardcode an assumption in
 * the UI copy either"). Basis points avoid float rounding on percentages.
 */
function getCommissionBps(): number {
  const raw = process.env.PLATFORM_COMMISSION_BPS;
  if (!raw) {
    throw new Error("PLATFORM_COMMISSION_BPS is not set");
  }
  const bps = Number(raw);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    throw new Error("PLATFORM_COMMISSION_BPS must be an integer between 0 and 10000 (basis points)");
  }
  return bps;
}

/** Haven Rush's cut of a booking, in cents, computed fresh from the current rate. */
export function calculateApplicationFeeCents(priceCents: number): number {
  return Math.round((priceCents * getCommissionBps()) / 10000);
}
