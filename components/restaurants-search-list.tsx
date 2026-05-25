"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoryProductCard } from "@/components/category-product-card";
import { RestaurantLogo } from "@/components/restaurant-logo";
import type { RestaurantSummary, SearchableMenuItem } from "@/lib/restaurants";

type RestaurantsSearchListProps = {
  restaurants: RestaurantSummary[];
  products: SearchableMenuItem[];
};

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function RestaurantsSearchList({ restaurants, products }: RestaurantsSearchListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);
  const isSearching = normalizedQuery.length > 0;
  const filteredRestaurants = useMemo(() => {
    if (!normalizedQuery) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => {
      const haystack = [
        restaurant.name,
        ...(restaurant.searchKeywords ?? [])
      ]
        .map(normalizeSearch)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, restaurants]);
  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.categoryName,
        product.restaurant.name,
        ...product.searchKeywords
      ]
        .map(normalizeSearch)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, products]);

  useEffect(() => {
    if (!normalizedQuery) {
      return;
    }

    console.info("[MenuYa search]", {
      query,
      products: filteredProducts.length,
      restaurants: filteredRestaurants.length
    });
  }, [filteredProducts.length, filteredRestaurants.length, normalizedQuery, query]);

  return (
    <>
      <form
        className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-card"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search size={19} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o comida"
          className="w-full bg-transparent text-sm outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-ink-950 transition hover:bg-brand-500"
            aria-label="Limpiar busqueda"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white"
          aria-label="Buscar"
        >
          <SlidersHorizontal size={18} />
        </button>
      </form>

      {isSearching && (
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Comidas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Productos que coinciden con tu busqueda.
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-500">
              {filteredProducts.length}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <CategoryProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600 shadow-card">
              <h3 className="font-black text-slate-950">
                No encontramos comidas para esta busqueda
              </h3>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isSearching && (
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="mb-1 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">
                  Restaurantes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Locales relacionados con tu busqueda.
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-500">
                {filteredRestaurants.length}
              </span>
            </div>
          </div>
        )}

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

        {restaurants.length > 0 &&
          filteredRestaurants.length === 0 &&
          (!isSearching || filteredProducts.length === 0) && (
          <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600 shadow-card sm:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-black text-slate-950">
              No encontramos comidas ni restaurantes para esta busqueda
            </h2>
            <p className="mt-2 text-sm">
              Proba con otra comida, categoria o nombre de restaurante.
            </p>
          </div>
        )}

        {filteredRestaurants.map((restaurant) => (
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
                {restaurant.scheduleHint && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                    <span className="rounded-full bg-neutral-50 px-2.5 py-1.5 text-neutral-500">
                      {restaurant.scheduleHint}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
