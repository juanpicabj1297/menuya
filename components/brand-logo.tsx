import Link from "next/link";
import { Utensils } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-card">
        <Utensils size={19} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-lg font-black tracking-tight text-slate-950">
            Menu<span className="text-brand-600">Ya</span>
          </span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Suipacha
          </span>
        </span>
      )}
    </Link>
  );
}
