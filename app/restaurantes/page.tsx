import Link from "next/link";
import Image from "next/image";
import { Clock3, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
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
            className="hover-lift overflow-hidden rounded-[1.4rem] border border-white bg-white shadow-card"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={restaurant.cover}
                alt={restaurant.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
              <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-black text-mint-700 shadow-sm">
                {restaurant.isOpen ? "Abierto" : "Cerrado"}
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-black text-amber-700 shadow-sm">
                <Star size={13} fill="currentColor" />
                {restaurant.rating}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-black tracking-tight text-slate-950">
                {restaurant.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {restaurant.category}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {restaurant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={16} className="text-brand-600" />
                  {restaurant.deliveryTime}
                </span>
                <span>{restaurant.minimumOrder}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
