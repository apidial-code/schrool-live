// Elite learning access ends on recorded completion, not a calendar anniversary.
// A non-null end date can still close Elite access (for example on completion).
export function accessPeriodOpen(tier: string | null, accessEndsAt: Date | null, now: number) {
  if (accessEndsAt === null) return tier === "elite";
  return Number.isFinite(accessEndsAt.getTime()) && accessEndsAt.getTime() > now;
}
