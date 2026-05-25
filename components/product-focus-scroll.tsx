"use client";

import { useEffect } from "react";

type ProductFocusScrollProps = {
  productId: string | null;
};

export function ProductFocusScroll({ productId }: ProductFocusScrollProps) {
  useEffect(() => {
    if (!productId) {
      return;
    }

    const element = document.getElementById(`producto-${productId}`);

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [productId]);

  return null;
}
