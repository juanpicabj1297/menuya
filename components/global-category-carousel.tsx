"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { CategoryIcon } from "@/components/category-icon";
import type { GlobalCategory } from "@/lib/restaurants";

type GlobalCategoryCarouselProps = {
  categories: GlobalCategory[];
};

export function GlobalCategoryCarousel({ categories }: GlobalCategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollCategories(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth"
    });
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">
        Las categorias globales se van a mostrar aca cuando esten cargadas en
        Supabase.
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => scrollCategories("left")}
        className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-3 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-ink-950 opacity-0 shadow-card transition hover:border-brand-500 hover:bg-brand-500 group-hover:opacity-100 md:grid"
        aria-label="Ver categorias anteriores"
      >
        <ChevronLeft size={19} />
      </button>

      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categorias/${category.slug}`}
            className="min-w-28 snap-start rounded-[1.4rem] border border-neutral-200 bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand-500"
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-ink-950">
              <CategoryIcon iconName={category.iconName} />
            </span>
            <span className="mt-3 block text-sm font-black text-ink-950">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollCategories("right")}
        className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 translate-x-3 place-items-center rounded-full border border-neutral-200 bg-white text-ink-950 opacity-0 shadow-card transition hover:border-brand-500 hover:bg-brand-500 group-hover:opacity-100 md:grid"
        aria-label="Ver mas categorias"
      >
        <ChevronRight size={19} />
      </button>
    </div>
  );
}
