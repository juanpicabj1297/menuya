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
      className={`inline-flex items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition ${
        quantity > 0 ? "ring-2 ring-brand-100" : ""
      }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity === 0}
        aria-label="Disminuir cantidad"
        className={`grid place-items-center rounded-2xl text-slate-700 transition active:scale-95 disabled:cursor-not-allowed disabled:text-slate-300 ${
          compact ? "h-9 w-9" : "h-11 w-11"
        }`}
      >
        <Minus size={compact ? 15 : 17} />
      </button>
      <span
        className={`grid min-w-9 place-items-center text-center font-black text-slate-950 transition ${
          quantity > 0 ? "scale-110 text-brand-700" : ""
        }`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Aumentar cantidad"
        className={`grid place-items-center rounded-2xl bg-slate-950 text-white transition active:scale-95 ${
          compact ? "h-9 w-9" : "h-11 w-11"
        }`}
      >
        <Plus size={compact ? 15 : 17} />
      </button>
    </div>
  );
}
