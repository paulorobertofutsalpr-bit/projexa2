const GRACE_PERIOD_DAYS = 3;

export type EffectiveStatus = "trial" | "pending" | "active" | "overdue" | "blocked" | "cancelled";

export function computeEffectiveStatus(company: {
  subscriptionStatus: string;
  subscriptionOverdueSince: Date | null;
}): EffectiveStatus {
  if (company.subscriptionStatus === "overdue" && company.subscriptionOverdueSince) {
    const daysSince = (Date.now() - new Date(company.subscriptionOverdueSince).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= GRACE_PERIOD_DAYS) return "blocked";
  }
  return company.subscriptionStatus as EffectiveStatus;
}

export function daysRemainingInGrace(overdueSince: Date | string | null): number {
  if (!overdueSince) return GRACE_PERIOD_DAYS;
  const daysSince = (Date.now() - new Date(overdueSince).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(GRACE_PERIOD_DAYS - daysSince));
}

export { GRACE_PERIOD_DAYS };
