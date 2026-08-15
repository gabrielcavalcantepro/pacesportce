'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, CartContextType, Shipping } from '@/lib/types';

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'pacesportce_cart';
const SHIPPING_STORAGE_KEY = 'pacesportce_shipping';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipping, setShippingState] = useState<Shipping | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
      const storedShipping = localStorage.getItem(SHIPPING_STORAGE_KEY);
      if (storedShipping) setShippingState(JSON.parse(storedShipping));
    } catch {
      // ignore parse errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (shipping) {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
    } else {
      localStorage.removeItem(SHIPPING_STORAGE_KEY);
    }
  }, [shipping, hydrated]);

  function addItem(newItem: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === newItem.productId &&
          JSON.stringify(i.selectedVariant) === JSON.stringify(newItem.selectedVariant)
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
    setShippingState(null);
  }

  function setShipping(next: Shipping | null) {
    setShippingState(next);
  }

  const total =
    items.reduce((sum, i) => sum + i.price * i.quantity, 0) + (shipping?.price ?? 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        shipping,
        setShipping,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
