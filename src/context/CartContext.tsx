/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type CartMap = Record<string, number>;

interface CartContextType {
  cart: CartMap;
  itemCount: number;
  setItemQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'restauapp.cart.v1';

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function normalizeCartMap(value: unknown): CartMap {
  if (!value || typeof value !== 'object') return {};
  const raw = value as Record<string, unknown>;
  const next: CartMap = {};
  for (const [id, qty] of Object.entries(raw)) {
    if (typeof id !== 'string' || !id) continue;
    if (typeof qty !== 'number' || !Number.isFinite(qty)) continue;
    if (!Number.isInteger(qty) || qty <= 0) continue;
    next[id] = qty;
  }
  return next;
}

function loadCart(): CartMap {
  if (!isBrowserStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const parsed = safeJsonParse(raw);
    return normalizeCartMap(parsed);
  } catch {
    return {};
  }
}

function saveCart(cart: CartMap) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore write errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartMap>(() => loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const setItemQuantity = (id: string, quantity: number) => {
    const nextQuantity = Math.max(0, Math.floor(quantity));
    setCart((prev) => {
      if (nextQuantity <= 0) {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      if (prev[id] === nextQuantity) return prev;
      return { ...prev, [id]: nextQuantity };
    });
  };

  const increment = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setCart((prev) => {
      const nextQty = (prev[id] ?? 0) - 1;
      if (nextQty <= 0) {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: nextQty };
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const itemCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      itemCount,
      setItemQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [cart, itemCount, isCartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

