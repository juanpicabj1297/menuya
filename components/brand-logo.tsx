import Link from "next/link";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  void compact;

  return (
    <Link
      href="/"
      className="group inline-flex items-center rounded-2xl px-1 py-1 transition hover:bg-neutral-50"
      aria-label="MenuYa"
    >
      <span className="relative inline-flex items-baseline rounded-2xl bg-white py-1 pl-1.5 pr-6">
        <span className="text-[1.7rem] font-black leading-none tracking-normal text-ink-950">
          Menu
        </span>
        <span className="text-[1.7rem] font-black leading-none tracking-normal text-brand-600 transition group-hover:text-brand-500">
          Ya
        </span>
        <span className="absolute -right-3 top-0 h-1.5 w-4 rotate-[-28deg] rounded-full bg-brand-500" />
        <span className="absolute -right-5 top-4 h-1.5 w-4 rotate-[-4deg] rounded-full bg-brand-500" />
      </span>
    </Link>
  );
}
