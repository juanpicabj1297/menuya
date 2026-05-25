import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Star } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { MenuItemCard } from "@/components/menu-item-card";
import { ProductFocusScroll } from "@/components/product-focus-scroll";
import { RestaurantLogo } from "@/components/restaurant-logo";
import { getRestaurantWithMenu } from "@/lib/restaurants";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ producto?: string }>;
};

export default async function RestaurantMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const highlightedProductId = (await searchParams)?.producto ?? null;
  const restaurant = await getRestaurantWithMenu(slug);

  if (!restaurant) {
    notFound();
  }

  const menuGroups = restaurant.menu.reduce<
    {
      name: string;
      order: number;
      items: typeof restaurant.menu;
    }[]
  >((groups, item) => {
    const group = groups.find((current) => current.name === item.categoryName);

    if (group) {
      group.items.push(item);
      return groups;
    }

    return [
      ...groups,
      {
        name: item.categoryName,
        order: item.categoryOrder,
        items: [item]
      }
    ];
  }, []);
  const hoursByDay = restaurant.hours.reduce<
    { day: string; intervals: string[]; order: number }[]
  >((groups, hour) => {
    const interval = `${hour.openTime}-${hour.closeTime}`;
    const group = groups.find((current) => current.day === hour.dayLabel);

    if (group) {
      group.intervals.push(interval);
      return groups;
    }

    return [
      ...groups,
      {
        day: hour.dayLabel,
        intervals: [interval],
        order: hour.dayOfWeek
      }
    ];
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6">
      <ProductFocusScroll productId={highlightedProductId} />
      <nav className="sticky top-3 z-20 mb-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
        <BrandLogo compact />
        <Link
          href="/restaurantes"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
        >
          <ArrowLeft size={17} />
          Restaurantes
        </Link>
      </nav>

      <header className="animate-soft-in overflow-hidden rounded-[1.7rem] border border-neutral-200 bg-white shadow-card">
        <div className="relative h-56 sm:h-72">
          <Image
            src={restaurant.cover}
            alt={restaurant.name}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent" />
        </div>
        <div className="relative px-5 pb-5 pt-0">
          <div className="-mt-12 mb-3">
            <RestaurantLogo
              name={restaurant.name}
              logoUrl={restaurant.logoUrl}
              size="lg"
            />
          </div>
          <p className="text-sm font-bold text-neutral-500">
            {restaurant.category}
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-ink-950">
            {restaurant.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            {restaurant.rating && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1.5 text-ink-950">
                <Star size={13} className="text-brand-600" fill="currentColor" />
                {restaurant.rating}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1.5 text-ink-950">
              <Clock3 size={13} />
              {restaurant.deliveryTime}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 ${
                restaurant.scheduleStatus === "open"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-neutral-100 text-ink-950"
              }`}
            >
              {restaurant.scheduleLabel}
            </span>
          </div>
        </div>
      </header>

      <section className="mt-5 rounded-[1.4rem] border border-neutral-200 bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-neutral-100 text-ink-950">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2 className="text-sm font-black text-ink-950">Horarios</h2>
            <p className="text-xs font-semibold text-neutral-500">
              {restaurant.scheduleHint ?? restaurant.scheduleLabel}
            </p>
          </div>
        </div>
        {hoursByDay.length === 0 ? (
          <div className="rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-semibold text-neutral-500">
            Consultar horario
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {hoursByDay
              .sort((a, b) => a.order - b.order)
              .map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-3 py-3 text-sm"
                >
                  <span className="font-black text-ink-950">{day.day}</span>
                  <span className="text-right font-semibold text-neutral-500">
                    {day.intervals.join(" / ")}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {restaurant.tags.map((tag) => (
          <span
            key={tag}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-600 shadow-sm"
          >
            {tag}
          </span>
        ))}
      </section>

      <section className="mt-6 space-y-6">
        {restaurant.menu.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-card">
            <h2 className="font-black text-slate-950">
              Este restaurante todavia no cargo productos.
            </h2>
            <p className="mt-2">
              Cuando el comercio publique su menu en Supabase, los productos
              apareceran aca automaticamente.
            </p>
          </div>
        )}

        {menuGroups
          .sort((a, b) => a.order - b.order)
          .map((group) => (
            <div key={group.name}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  {group.name}
                </h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
                  {group.items.length}
                </span>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    highlighted={item.id === highlightedProductId}
                    restaurant={{
                      id: restaurant.id,
                      name: restaurant.name,
                      slug: restaurant.slug,
                      phone: restaurant.phone
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
      </section>

      <CartLink
        label="Ir al carrito"
        className="fixed inset-x-4 bottom-5 mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-soft"
      />
    </main>
  );
}
