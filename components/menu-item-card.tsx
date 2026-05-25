"use client";

import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { DiscountBadge } from "@/components/discount-badge";
import { QuantityControl } from "@/components/quantity-control";
import type { MenuItem } from "@/lib/restaurants";
import { getDiscountPercent, getEffectivePrice } from "@/lib/promotions";

type MenuItemCardProps = {
  item: MenuItem;
  highlighted?: boolean;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
  };
};

export function MenuItemCard({ item, highlighted = false, restaurant }: MenuItemCardProps) {
  const { getQuantity, increment, decrement } = useCart();
  const quantity = getQuantity(item.id);
  const discountPercent = getDiscountPercent(item.price, item.discountPrice);
  const effectivePrice = getEffectivePrice(item.price, item.discountPrice);

  return (
    <article
      id={`producto-${item.id}`}
      className={`hover-lift flex items-center gap-4 rounded-2xl border bg-white p-3 shadow-card transition ${
        highlighted
          ? "border-brand-500 ring-4 ring-brand-50"
          : quantity > 0
            ? "border-brand-100"
            : "border-white"
      }`}
    >
      <Image
        src={item.image}
        alt={item.name}
        width={96}
        height={96}
        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-black text-slate-950">{item.name}</h2>
          {quantity > 0 && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-xs font-black text-brand-700">
              {quantity} en carrito
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {item.description}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
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
          <QuantityControl
            compact
            quantity={quantity}
            onIncrement={() =>
              increment({
                id: item.id,
                name: item.name,
                price: effectivePrice,
                originalPrice: discountPercent ? item.price : null,
                discountPercent,
                image: item.image,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantSlug: restaurant.slug,
                restaurantPhone: restaurant.phone ?? ""
              })
            }
            onDecrement={() => decrement(item.id)}
          />
        </div>
      </div>
    </article>
  );
}
