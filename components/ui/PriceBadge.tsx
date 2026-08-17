import { cn } from "@/lib/utils";

/** Small inline price tag shown next to any paid option (spec section 66). */
export function PriceBadge({ amount, className }: { amount: number; className?: string }) {
  if (amount <= 0) {
    return (
      <span className={cn("text-[11px] font-semibold uppercase tracking-wide text-emerald-600", className)}>
        Included
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold text-[var(--dg-text,#241A17)]",
        className
      )}
    >
      ₹{amount}
    </span>
  );
}
