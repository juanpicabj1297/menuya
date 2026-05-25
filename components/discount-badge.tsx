type DiscountBadgeProps = {
  percent: number;
  compact?: boolean;
};

export function DiscountBadge({ percent, compact = false }: DiscountBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full bg-ink-950 font-black text-brand-500 ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {percent}% OFF
    </span>
  );
}
