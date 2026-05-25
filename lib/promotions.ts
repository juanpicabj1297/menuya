export function getDiscountPercent(price: number, discountPrice?: number | null) {
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) {
    return null;
  }

  return Math.round(((price - discountPrice) / price) * 100);
}

export function getEffectivePrice(price: number, discountPrice?: number | null) {
  return getDiscountPercent(price, discountPrice) ? discountPrice ?? price : price;
}
