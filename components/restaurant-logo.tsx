import Image from "next/image";

type RestaurantLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-14 w-14 rounded-2xl",
  md: "h-20 w-20 rounded-[1.4rem]",
  lg: "h-24 w-24 rounded-[1.7rem]"
};

const imageSizes = {
  sm: 56,
  md: 80,
  lg: 96
};

export function RestaurantLogo({
  name,
  logoUrl,
  size = "md"
}: RestaurantLogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "M";

  if (logoUrl) {
    return (
      <div
        className={`${sizeClasses[size]} relative shrink-0 overflow-hidden border border-neutral-200 bg-white shadow-card`}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes={`${imageSizes[size]}px`}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} grid shrink-0 place-items-center border border-neutral-200 bg-ink-950 text-2xl font-black text-brand-500 shadow-card`}
    >
      {initial}
    </div>
  );
}
