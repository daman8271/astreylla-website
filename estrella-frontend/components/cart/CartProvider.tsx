"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { Cart } from "@/lib/shopify";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/cart-actions";

type CartCtx = {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (merchandiseId: string, quantity?: number) => Promise<string | null>;
  updateLine: (lineId: string, quantity: number) => Promise<string | null>;
  removeLine: (lineId: string) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const next = await getCartAction();
    setCart(next);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(
    async (merchandiseId: string, quantity = 1): Promise<string | null> => {
      const result = await addToCartAction(merchandiseId, quantity);
      if (result.cart) setCart(result.cart);
      if (!result.error) setIsOpen(true);
      return result.error ?? null;
    },
    []
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number): Promise<string | null> => {
      const result = await updateCartLineAction(lineId, quantity);
      if (result.cart) setCart(result.cart);
      return result.error ?? null;
    },
    []
  );

  const removeLine = useCallback(
    async (lineId: string): Promise<string | null> => {
      const result = await removeCartLineAction(lineId);
      if (result.cart) setCart(result.cart);
      return result.error ?? null;
    },
    []
  );

  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("estrella:open-cart", onOpen);
    return () => window.removeEventListener("estrella:open-cart", onOpen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const evt = new CustomEvent("estrella:cart-count", {
      detail: { count: cart?.totalQuantity ?? 0 },
    });
    window.dispatchEvent(evt);
  }, [cart?.totalQuantity]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const value = useMemo<CartCtx>(
    () => ({
      cart,
      isOpen,
      isLoading: isPending,
      openCart,
      closeCart,
      addToCart: (id, qty) =>
        new Promise<string | null>((resolve) => {
          startTransition(async () => {
            resolve(await addToCart(id, qty));
          });
        }),
      updateLine: (id, qty) =>
        new Promise<string | null>((resolve) => {
          startTransition(async () => {
            resolve(await updateLine(id, qty));
          });
        }),
      removeLine: (id) =>
        new Promise<string | null>((resolve) => {
          startTransition(async () => {
            resolve(await removeLine(id));
          });
        }),
      refresh: () =>
        new Promise<void>((resolve) => {
          startTransition(async () => {
            await refresh();
            resolve();
          });
        }),
    }),
    [cart, isOpen, isPending, openCart, closeCart, addToCart, updateLine, removeLine, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
