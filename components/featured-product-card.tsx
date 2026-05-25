"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { DiscountBadge } from "@/components/discount-badge";
import { RestaurantLogoOverlay } from "@/components/restaurant-logo-overlay";
import type { MenuItem } from "@/lib/restaurants";
import { getDiscountPercent, getEffectivePrice } from "@/lib/promotions";

type FeaturedProductCardProps = {
  item: MenuItem;
};

export function FeaturedProductCard({ item }: FeaturedProductCardProps) {
  const { getQuantity, increment } = useCart();
  const quantity = getQuantity(item.id);
  const discountPercent = getDiscountPercent(item.price, item.discountPrice);
  const effectivePrice = getEffectivePrice(item.price, item.discountPrice);
  const restaurantHref = (item.restaurantSlug
    ? `/restaurantes/${item.restaurantSlug}?producto=${item.id}`
    : "/restaurantes") as Route;

  function addToCart() {
    increment({
      id: item.id,
      name: item.name,
      price: effectivePrice,
      originalPrice: discountPercent ? item.price : null,
      discountPercent,
      image: item.image,
      restaurantId: item.restaurantId ?? item.restaurantSlug ?? "restaurant",
      restaurantName: item.restaurantName ?? "Restaurante",
      restaurantSlug: item.restaurantSlug ?? "",
      restaurantPhone: item.restaurantPhone ?? ""
    });
  }

  return (
    <article className="min-w-64 max-w-72 snap-start overflow-hidden rounded-[1.6rem] border border-neutral-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-brand-500">
      <Link href={restaurantHref} className="block">
        <div className="relative h-40">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 260px"
            className="object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <RestaurantLogoOverlay
              logoUrl={item.restaurantLogoUrl}
              restaurantName={item.restaurantName}
            />
          </div>
          {discountPercent && (
            <span className="absolute right-3 top-3">
              <DiscountBadge percent={discountPercent} />
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={restaurantHref} className="block">
          <h3 className="line-clamp-1 font-black text-ink-950">{item.name}</h3>
          {item.restaurantName && (
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
              {item.restaurantName}
            </p>
          )}
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-neutral-500">
            {item.description}
          </p>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-black text-ink-950">
              ${effectivePrice.toLocaleString("es-AR")}
            </p>
            {discountPercent && (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs font-bold text-neutral-400 line-through">
                  ${item.price.toLocaleString("es-AR")}
                </p>
                <DiscountBadge percent={discountPercent} compact />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="inline-flex h-10 items-center gap-1 rounded-2xl bg-ink-950 px-3 text-sm font-black text-white transition hover:bg-brand-500 hover:text-ink-950"
          >
            <Plus size={16} />
            {quantity > 0 ? quantity : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}
