import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { FeaturedProductCard } from "@/components/featured-product-card";
import { getPromotionalMenuItems } from "@/lib/restaurants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PromosPage() {
  const products = await getPromotionalMenuItems("suipacha", 48);

  return (
    <main className="min-h-screen bg-white text-ink-950">
      <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <header className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-neutral-200 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-ink-950 transition hover:border-brand-500"
            >
              <ArrowLeft size={16} />
              Inicio
            </Link>
            <CartLink label="" />
          </div>
        </header>

        <section className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-700">
            MenuYa
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-ink-950 sm:text-6xl">
            Promos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
            Productos con descuento ordenados de mayor a menor ahorro.
          </p>
        </section>

        <section className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm font-semibold text-neutral-500">
              Todavia no hay promociones activas.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((item) => (
                <FeaturedProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
