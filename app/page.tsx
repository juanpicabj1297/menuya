import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { getFeaturedRestaurants } from "@/lib/restaurants";

export default async function HomePage() {
  const restaurants = await getFeaturedRestaurants();
  const heroRestaurant = restaurants[0];

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6">
        <nav className="sticky top-3 z-20 flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-3 py-3 shadow-card backdrop-blur">
          <BrandLogo />
          <Link
            href="/restaurante/login"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-100 hover:bg-brand-50"
          >
            Soy restaurante
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[1fr_0.95fr] md:py-14">
          <div className="animate-soft-in">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-brand-700 shadow-card">
              <Sparkles size={15} />
              Pedidos online en Suipacha
            </p>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.96] tracking-tight text-slate-950 sm:text-6xl">
              Tu comida local, lista en pocos pasos.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              MenuYa conecta vecinos y comercios de ciudades chicas con una
              experiencia simple, clara y confiable. Sin llamadas eternas, sin
              GPS, con delivery propio de cada restaurante.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Delivery propio", "Retiro en local", "Sin app nativa"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/restaurantes"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Ver restaurantes <ArrowRight size={18} />
              </Link>
              <CartLink
                label="Ver carrito"
                className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-800 shadow-sm transition hover:border-brand-100 hover:bg-brand-50"
              />
            </div>
          </div>

          <div className="animate-soft-in rounded-[2rem] border border-white bg-white/90 p-3 shadow-soft backdrop-blur md:p-4">
            <div className="relative h-60 overflow-hidden rounded-[1.5rem] bg-slate-950 text-white sm:h-72">
              {heroRestaurant && (
                <Image
                  src={heroRestaurant.cover}
                  alt={heroRestaurant.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 520px, 100vw"
                  className="object-cover opacity-75"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                  <ShieldCheck size={15} />
                  Comercios verificados
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Pedidos simples para el barrio.
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {restaurants.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Todavia no hay restaurantes cargados para Suipacha.
                </div>
              )}

              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.slug}
                  href={`/restaurantes/${restaurant.slug}`}
                  className="hover-lift flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <Image
                    src={restaurant.cover}
                    alt={restaurant.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-950">
                      {restaurant.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock3 size={14} />
                      {restaurant.deliveryTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
                    <Star size={13} fill="currentColor" />
                    {restaurant.rating}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-card md:flex">
          <Search size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-500">
            Busca pizzas, hamburguesas, minutas o el comercio de siempre.
          </span>
        </div>
      </section>
    </main>
  );
}
