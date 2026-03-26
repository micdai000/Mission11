import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Book } from "../types/Book";
import type { CartItem } from "../types/CartItem";

type CartContextValue = {
  items: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  totalItemCount: number;
  totalPrice: number;
};

const CART_STORAGE_KEY = "cart";

function toNumberPrice(price: Book["price"]): number {
  const n = Number(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function loadCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x: any) => ({
        bookId: Number(x.bookId),
        title: String(x.title),
        price: Number(x.price),
        quantity: Number(x.quantity),
      }))
      .filter(
        (x) =>
          Number.isFinite(x.bookId) &&
          typeof x.title === "string" &&
          Number.isFinite(x.price) &&
          Number.isFinite(x.quantity) &&
          x.quantity >= 1
      );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart: CartContextValue["addToCart"] = (book, quantity = 1) => {
    const q = Math.max(1, Math.floor(quantity));
    const price = toNumberPrice(book.price);

    setItems((prev) => {
      const existing = prev.find((x) => x.bookId === book.bookId);
      if (existing) {
        return prev.map((x) =>
          x.bookId === book.bookId ? { ...x, quantity: x.quantity + q } : x
        );
      }
      return [...prev, { bookId: book.bookId, title: book.title, price, quantity: q }];
    });
  };

  const removeFromCart: CartContextValue["removeFromCart"] = (bookId) => {
    setItems((prev) => prev.filter((x) => x.bookId !== bookId));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (bookId, quantity) => {
    const q = Math.max(1, Math.floor(quantity));
    setItems((prev) => prev.map((x) => (x.bookId === bookId ? { ...x, quantity: q } : x)));
  };

  const clearCart: CartContextValue["clearCart"] = () => setItems([]);

  const totalItemCount = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(() => items.reduce((sum, x) => sum + x.price * x.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

