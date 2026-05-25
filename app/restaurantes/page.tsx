import { MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { RestaurantsSearchList } from "@/components/restaurants-search-list";
import { getRestaurantsByCity, getSearchableMenuItems } from "@/lib/restaurants";

export default async function RestaurantsPage() {
  const [restaurants, products] = await Promise.all([
    getRestaurantsByCity(),
    getSearchableMenuItems()
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 sm:px-6">
      <nav className="sticky top-3 z-20 mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
        <BrandLogo />
        <CartLink />
      </nav>

      <header className="mb-6 animate-soft-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-700 shadow-sm">
          <MapPin size={15} />
          Suipacha, Buenos Aires
        </div>
        <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-slate-950">
          Restaurantes cerca tuyo
        </h1>
        <p className="mt-2 max-w-lg text-slate-600">
          Pedi delivery o coordina retiro directamente con cada local.
        </p>
      </header>

      <RestaurantsSearchList restaurants={restaurants} products={products} />
    </main>
  );
}
