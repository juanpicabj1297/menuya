import Link from "next/link";
import { Clock3, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { RestaurantLogo } from "@/components/restaurant-logo";
import { getRestaurantsByCity } from "@/lib/restaurants";

export default async function RestaurantsPage() {
  const restaurants = await getRestaurantsByCity();

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

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-card">
        <Search size={19} className="text-slate-400" />
        <input
          placeholder="Buscar por nombre o comida"
          className="w-full bg-transparent text-sm outline-none"
        />
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.length === 0 && (
          <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-card sm:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-black text-slate-950">
              Todavia no hay restaurantes publicados.
            </h2>
            <p className="mt-2 text-sm">
              Cuando un comercio de Suipacha cargue su perfil en Supabase,
              aparecera automaticamente en esta seccion.
            </p>
          </div>
        )}

        {restaurants.map((restaurant) => (
          <Link
            href={`/restaurantes/${restaurant.slug}`}
            key={restaurant.slug}
            className="hover-lift rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-card"
          >
            <div className="flex items-start gap-4">
              <RestaurantLogo
                name={restaurant.name}
                logoUrl={restaurant.logoUrl}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black tracking-tight text-slate-950">
                      {restaurant.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {restaurant.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
                      restaurant.scheduleStatus === "open"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-neutral-100 text-ink-950"
                    }`}
                  >
                    {restaurant.scheduleLabel}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1.5">
                    <Clock3 size={16} className="text-brand-600" />
                    {restaurant.deliveryTime}
                  </span>
                  {restaurant.scheduleHint && (
                    <span className="rounded-full bg-neutral-50 px-2.5 py-1.5 text-neutral-500">
                      {restaurant.scheduleHint}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
