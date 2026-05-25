"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { DiscountBadge } from "@/components/discount-badge";
import { QuantityControl } from "@/components/quantity-control";
import { RestaurantLogoOverlay } from "@/components/restaurant-logo-overlay";
import type { CategoryProduct } from "@/lib/restaurants";
import { getDiscountPercent, getEffectivePrice } from "@/lib/promotions";

type CategoryProductCardProps = {
  product: CategoryProduct;
};

export function CategoryProductCard({ product }: CategoryProductCardProps) {
  const { getQuantity, increment, decrement } = useCart();
  const quantity = getQuantity(product.id);
  const discountPercent = getDiscountPercent(product.price, product.discountPrice);
  const effectivePrice = getEffectivePrice(product.price, product.discountPrice);
  const isOpen = product.restaurant.scheduleStatus === "open";

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-neutral-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-brand-500">
      <div className="relative h-44">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black ${
            isOpen ? "bg-brand-500 text-ink-950" : "bg-white/90 text-neutral-600"
          }`}
        >
          {isOpen ? "Abierto ahora" : "Cerrado"}
        </span>
        {discountPercent && (
          <span className="absolute right-3 top-3">
            <DiscountBadge percent={discountPercent} />
          </span>
        )}
        <div className="absolute bottom-3 left-3">
          <RestaurantLogoOverlay
            logoUrl={product.restaurant.logoUrl}
            restaurantName={product.restaurant.name}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-1 text-lg font-black text-ink-950">
              {product.name}
            </h2>
            <Link
              href={`/restaurantes/${product.restaurant.slug}`}
              className="mt-1 block truncate text-sm font-bold text-neutral-500 transition hover:text-ink-950"
            >
              {product.restaurant.name}
            </Link>
          </div>
          {quantity > 0 && (
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-700">
              {quantity}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-ink-950">
              ${effectivePrice.toLocaleString("es-AR")}
            </p>
            {discountPercent && (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs font-bold text-neutral-400 line-through">
                  ${product.price.toLocaleString("es-AR")}
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
                id: product.id,
                name: product.name,
                price: effectivePrice,
                originalPrice: discountPercent ? product.price : null,
                discountPercent,
                image: product.image,
                restaurantId: product.restaurant.id,
                restaurantName: product.restaurant.name,
                restaurantSlug: product.restaurant.slug,
                restaurantPhone: product.restaurant.phone ?? ""
              })
            }
            onDecrement={() => decrement(product.id)}
          />
        </div>
      </div>
    </article>
  );
}
