import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Search,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { FeaturedProductCard } from "@/components/featured-product-card";
import { GlobalCategoryCarousel } from "@/components/global-category-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { RestaurantLogo } from "@/components/restaurant-logo";
import {
  getCurrentRestaurantSession,
  getFeaturedRestaurants,
  getGlobalCategories,
  getMostOrderedMenuItems,
  getPromotionalMenuItems
} from "@/lib/restaurants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [restaurants, categories, featuredItems, promoItems, restaurantSession] = await Promise.all([
    getFeaturedRestaurants(),
    getGlobalCategories(),
    getMostOrderedMenuItems(),
    getPromotionalMenuItems("suipacha", 6),
    getCurrentRestaurantSession()
  ]);
  const restaurantButtonHref = restaurantSession
    ? "/restaurante/panel"
    : "/restaurante/login";
  const restaurantDesktopLabel = restaurantSession
    ? `Perfil de ${restaurantSession.name}`
    : "Soy restaurante";
  const restaurantMobileLabel = restaurantSession ? "Mi panel" : "Soy restaurante";

  return (
    <main className="min-h-screen bg-white text-ink-950">
      <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <header className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-neutral-200 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Link
              href={restaurantButtonHref}
              className="inline-flex max-w-[9rem] items-center justify-center rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-ink-950 transition hover:border-brand-500 sm:max-w-none sm:px-4"
            >
              <span className="truncate sm:hidden">{restaurantMobileLabel}</span>
              <span className="hidden truncate sm:inline">{restaurantDesktopLabel}</span>
            </Link>
            <CartLink label="" />
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white px-4 py-10 shadow-card sm:px-8 sm:py-14">
          <HeroCarousel />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
              <MapPin size={14} className="text-brand-600" />
              Suipacha
            </div>
            <h1 className="text-5xl font-black tracking-tight text-ink-950 sm:text-7xl">
              ¿Qué vas a pedir hoy?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-neutral-500">
              Pedi facil, pedi local. Elegi tu comida y habla directo con el
              comercio por WhatsApp.
            </p>

          </div>

          <Link
            href="/restaurantes"
            className="relative mx-auto mt-8 flex w-full max-w-6xl items-center gap-3 rounded-[1.6rem] border border-neutral-200 bg-white/95 p-3 text-left shadow-soft backdrop-blur transition hover:border-brand-500"
          >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
                <Search size={21} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-ink-950">
                  Buscar comidas, locales...
                </span>
                <span className="mt-0.5 block truncate text-sm text-neutral-400">
                  Pizzas, hamburguesas, empanadas, bebidas
                </span>
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-ink-950">
                <ArrowRight size={20} />
              </span>
          </Link>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-ink-950">
                Categorias
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Accesos rapidos para pedir sin vueltas.
              </p>
            </div>
          </div>

          <GlobalCategoryCarousel categories={categories} />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-ink-950">
                Locales destacados
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Comercios de Suipacha listos para tomar pedidos.
              </p>
            </div>
            <Link
              href="/restaurantes"
              className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-black text-ink-950 transition hover:bg-brand-500"
            >
              Ver todos
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.slug}
                href={`/restaurantes/${restaurant.slug}`}
                className="hover-lift rounded-[1.6rem] border border-neutral-200 bg-white p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <RestaurantLogo
                    name={restaurant.name}
                    logoUrl={restaurant.logoUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-ink-950">
                      {restaurant.name}
                    </h3>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${
                        restaurant.scheduleStatus === "open"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {restaurant.scheduleStatus === "open"
                        ? "Abierto ahora"
                        : "Cerrado"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-ink-950">
                Mas pedido
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Fotos grandes para elegir rapido.
              </p>
            </div>
            <Link
              href="/mas-pedido"
              className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-black text-ink-950 transition hover:bg-brand-500"
            >
              Ver mas
            </Link>
          </div>

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0">
            {featuredItems.slice(0, 4).map((item) => (
              <FeaturedProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {promoItems.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-ink-950">
                  Promos
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Descuentos reales de comercios locales.
                </p>
              </div>
              <Link
                href="/promos"
                className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-black text-ink-950 transition hover:bg-brand-500"
              >
                Ver mas
              </Link>
            </div>

            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0">
              {promoItems.slice(0, 4).map((item) => (
                <FeaturedProductCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        <section className="my-10 rounded-[1.8rem] border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-500 text-ink-950">
              <HeartHandshake size={24} />
            </span>
            <div>
              <h2 className="text-lg font-black text-ink-950">
                Pedi facil, pedi local
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Espacio preparado para promociones, combos y novedades de los
                comercios de la ciudad.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
