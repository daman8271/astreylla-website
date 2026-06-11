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
import { useRouter } from "next/navigation";
import type { Cart } from "@/lib/shopify";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/cart-actions";

type DbCartItem = {
  id: string;
  augmontCartItemId: string;
  diamondId: string;
  diamond: any;
  addedAt: string;
};

type CartCtx = {
  cart: Cart | null;
  dbCartItems: DbCartItem[];
  dbCartTotal: number;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (merchandiseId: string, quantity?: number) => Promise<string | null>;
  updateLine: (lineId: string, quantity: number) => Promise<string | null>;
  removeLine: (lineId: string) => Promise<string | null>;
  removeDbLine: (id: string) => Promise<string | null>;
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
  const [dbCartItems, setDbCartItems] = useState<DbCartItem[]>([]);
  const [dbCartTotal, setDbCartTotal] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const refreshDbCart = useCallback(async () => {
    if (typeof window === "undefined") return;
    const sessionId = window.localStorage.getItem("estrella_session_id");
    if (!sessionId) {
      setDbCartItems([]);
      setDbCartTotal(0);
      return;
    }
    const shop = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "trial-shop-sqxnl71f.myshopify.com";
    try {
      const res = await fetch(`/api/widget/api/public/cart?shop=${encodeURIComponent(shop)}&sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        setDbCartItems(data.items || []);
        setDbCartTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error loading database cart:", err);
    }
  }, []);

  const refresh = useCallback(async () => {
    const next = await getCartAction();
    setCart(next);
    await refreshDbCart();
  }, [refreshDbCart]);

  const openCart = useCallback(() => {
    router.push("/cart");
  }, [router]);

  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(
    async (merchandiseId: string, quantity = 1): Promise<string | null> => {
      const result = await addToCartAction(merchandiseId, quantity);
      if (result.cart) setCart(result.cart);
      if (!result.error) {
        router.push("/cart");
      }
      return result.error ?? null;
    },
    [router]
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

  const removeDbLine = useCallback(
    async (id: string): Promise<string | null> => {
      if (typeof window === "undefined") return "No window";
      const sessionId = window.localStorage.getItem("estrella_session_id");
      if (!sessionId) return "No session ID";
      const shop = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "trial-shop-sqxnl71f.myshopify.com";
      try {
        const res = await fetch(`/api/widget/api/public/cart/${id}?shop=${encodeURIComponent(shop)}&sessionId=${encodeURIComponent(sessionId)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await refreshDbCart();
          window.dispatchEvent(new CustomEvent("estrella-cart-changed"));
          return null;
        }
        return "Delete failed";
      } catch (err) {
        return (err as Error).message;
      }
    },
    [refreshDbCart]
  );

  useEffect(() => {
    refreshDbCart();
    const handleChanged = () => {
      refreshDbCart();
    };
    window.addEventListener("estrella-cart-changed", handleChanged);
    return () => window.removeEventListener("estrella-cart-changed", handleChanged);
  }, [refreshDbCart]);

  useEffect(() => {
    const onOpen = () => {
      router.push("/cart");
    };
    window.addEventListener("estrella:open-cart", onOpen);
    return () => window.removeEventListener("estrella:open-cart", onOpen);
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const count = (cart?.totalQuantity ?? 0) + dbCartItems.length;
    const evt = new CustomEvent("estrella:cart-count", {
      detail: { count },
    });
    window.dispatchEvent(evt);
  }, [cart?.totalQuantity, dbCartItems.length]);

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
      dbCartItems,
      dbCartTotal,
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
      removeDbLine: (id) =>
        new Promise<string | null>((resolve) => {
          startTransition(async () => {
            resolve(await removeDbLine(id));
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
    [cart, dbCartItems, dbCartTotal, isOpen, isPending, openCart, closeCart, addToCart, updateLine, removeLine, removeDbLine, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
