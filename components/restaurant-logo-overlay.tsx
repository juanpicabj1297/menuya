import Image from "next/image";

type RestaurantLogoOverlayProps = {
  logoUrl?: string | null;
  restaurantName?: string | null;
};

export function RestaurantLogoOverlay({
  logoUrl,
  restaurantName
}: RestaurantLogoOverlayProps) {
  if (logoUrl) {
    return (
      <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-ink-950 bg-white shadow-card ring-2 ring-brand-500">
        <Image
          src={logoUrl}
          alt={`${restaurantName ?? "Restaurante"} logo`}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink-950 bg-ink-950 text-base font-black text-brand-500 shadow-card ring-2 ring-brand-500">
      {(restaurantName ?? "M").trim().charAt(0).toUpperCase() || "M"}
    </div>
  );
}
