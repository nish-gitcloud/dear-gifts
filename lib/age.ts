/**
 * Dynamic age/duration counter (spec section 37). Never hardcode these
 * values — always compute from the actual date the creator entered.
 */
export interface DurationBreakdown {
  years: number;
  days: number;
  hours: number;
  minutes: number;
}

export function calculateDurationSince(dateString: string, now: Date = new Date()): DurationBreakdown {
  const start = new Date(dateString);
  const diffMs = Math.max(0, now.getTime() - start.getTime());

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  let years = now.getFullYear() - start.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
  if (!hasHadBirthdayThisYear) years -= 1;

  return { years: Math.max(0, years), days, hours, minutes };
}
