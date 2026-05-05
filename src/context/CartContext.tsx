/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type CartMap = Record<string, number>;

interface CartContextType {
  cart: CartMap;
  promoCode: string | null;
  itemCount: number;
  setItemQuantity: (id: string, quantity: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null) => void;
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

interface CartData {
  cart: CartMap;
  promoCode?: string | null;
}

function loadCart(): CartData {
  if (!isBrowserStorageAvailable()) return { cart: {} };
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return { cart: {} };
    const parsed = safeJsonParse(raw) as { cart?: unknown; promoCode?: unknown } | null;
    return {
      cart: normalizeCartMap(parsed?.cart),
      promoCode: typeof parsed?.promoCode === 'string' ? parsed.promoCode : null,
    };
  } catch {
    return { cart: {} };
  }
}

function saveCart(data: CartData) {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CartData>(() => loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cart = data.cart;
  const promoCode = data.promoCode ?? null;

  useEffect(() => {
    saveCart(data);
  }, [data]);

  const setItemQuantity = (id: string, quantity: number) => {
    const nextQuantity = Math.max(0, Math.floor(quantity));
    setData((prev) => {
      const prevCart = prev.cart;
      if (nextQuantity <= 0) {
        if (!prevCart[id]) return prev;
        const nextCart = { ...prevCart };
        delete nextCart[id];
        return { ...prev, cart: nextCart };
      }
      if (prevCart[id] === nextQuantity) return prev;
      return { ...prev, cart: { ...prevCart, [id]: nextQuantity } };
    });
  };

  const increment = (id: string) => {
    setData((prev) => ({
      ...prev,
      cart: { ...prev.cart, [id]: (prev.cart[id] ?? 0) + 1 },
    }));
  };

  const decrement = (id: string) => {
    setData((prev) => {
      const nextQty = (prev.cart[id] ?? 0) - 1;
      if (nextQty <= 0) {
        if (!prev.cart[id]) return prev;
        const nextCart = { ...prev.cart };
        delete nextCart[id];
        return { ...prev, cart: nextCart };
      }
      return {
        ...prev,
        cart: { ...prev.cart, [id]: nextQty },
      };
    });
  };

  const removeItem = (id: string) => {
    setData((prev) => {
      if (!prev.cart[id]) return prev;
      const nextCart = { ...prev.cart };
      delete nextCart[id];
      return { ...prev, cart: nextCart };
    });
  };

  const clearCart = () => setData({ cart: {}, promoCode: null });

  const setPromoCode = (code: string | null) => {
    setData((prev) => ({ ...prev, promoCode: code }));
  };

  const itemCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      promoCode,
      itemCount,
      setItemQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      setPromoCode,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [cart, promoCode, itemCount, isCartOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

