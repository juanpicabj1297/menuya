"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  image: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantPhone: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  getQuantity: (id: string) => number;
  addItem: (product: CartProduct) => void;
  increment: (product: CartProduct) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "menuya-cart";

function readStoredCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const addItem = useCallback((product: CartProduct) => {
    setItems((currentItems) => {
      const isOtherRestaurant =
        currentItems.length > 0 &&
        currentItems.some((item) => item.restaurantId !== product.restaurantId);

      if (isOtherRestaurant) {
        return [{ ...product, quantity: 1 }];
      }

      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return {
      items,
      totalItems,
      totalPrice,
      getQuantity: (id) =>
        items.find((item) => item.id === id)?.quantity ?? 0,
      addItem,
      increment: addItem,
      decrement,
      removeItem,
      clearCart
    };
  }, [addItem, clearCart, decrement, items, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
