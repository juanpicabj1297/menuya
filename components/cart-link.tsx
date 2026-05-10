"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type CartLinkProps = {
  label?: string;
  className?: string;
};

export function CartLink({ label = "Carrito", className }: CartLinkProps) {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrito"
      className={
        className ??
        "relative inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
      }
    >
      <span className="relative">
        <ShoppingBag size={18} />
        {totalItems > 0 && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-black leading-none text-white shadow-sm">
            {totalItems}
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}
