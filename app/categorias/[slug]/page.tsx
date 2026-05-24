import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartLink } from "@/components/cart-link";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryProductCard } from "@/components/category-product-card";
import { getProductsByGlobalCategory } from "@/lib/restaurants";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getProductsByGlobalCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-ink-950">
      <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <header className="sticky top-3 z-20 flex items-center justify-between rounded-[1.4rem] border border-neutral-200 bg-white/90 px-3 py-3 shadow-card backdrop-blur">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-ink-950 transition hover:border-brand-500 sm:inline-flex"
            >
              Inicio
            </Link>
            <CartLink label="" />
          </div>
        </header>

        <section className="mt-6 rounded-[2rem] border border-neutral-200 bg-neutral-50 p-5 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-ink-950 shadow-card transition hover:bg-brand-500"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-ink-950 shadow-card">
                <CategoryIcon iconName={category.iconName} className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-700">
                Explorar comidas
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-ink-950 sm:text-6xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                Productos de distintos restaurantes locales, reunidos por tipo
                de comida para pedir mas rapido.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {category.products.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-neutral-200 bg-white p-8 text-center shadow-card">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-500">
                <Search size={22} />
              </span>
              <h2 className="mt-4 text-xl font-black text-ink-950">
                Todavia no hay productos
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Cuando los restaurantes carguen productos en esta categoria,
                van a aparecer aca automaticamente.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product) => (
                <CategoryProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
