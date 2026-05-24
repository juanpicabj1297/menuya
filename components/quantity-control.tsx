"use client";

import { Minus, Plus } from "lucide-react";

type QuantityControlProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  compact?: boolean;
};

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  compact = false
}: QuantityControlProps) {
  return (
    <div
      className={`inline-flex w-fit items-center rounded-full border border-neutral-200 bg-white shadow-sm transition ${
        quantity > 0 ? "border-brand-200 bg-brand-50/50" : ""
      }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity === 0}
        aria-label="Disminuir cantidad"
        className={`grid place-items-center rounded-full text-slate-700 transition active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
      >
        <Minus size={compact ? 14 : 16} />
      </button>
      <span
        className={`grid place-items-center px-2 text-center text-sm font-black text-slate-950 transition ${
          compact ? "min-w-7" : "min-w-9"
        } ${quantity > 0 ? "text-brand-700" : ""}`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Aumentar cantidad"
        className={`grid place-items-center rounded-full bg-ink-950 text-white transition active:scale-95 ${
          compact ? "h-8 w-8" : "h-10 w-10"
        }`}
      >
        <Plus size={compact ? 14 : 16} />
      </button>
    </div>
  );
}
