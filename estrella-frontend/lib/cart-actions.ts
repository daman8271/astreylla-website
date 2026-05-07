"use server";

import { cookies } from "next/headers";
import {
  shopifyClient,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_QUERY,
  type Cart,
} from "./shopify";

const CART_COOKIE = "estrella_cart_id";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  secure: process.env.NODE_ENV === "production",
};

type UserError = { field: string[] | null; message: string; code: string | null };
type MutationResult = { cart: Cart | null; userErrors: UserError[] };

async function call<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = (await shopifyClient.request(query, { variables })) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (res.errors?.length) {
    throw new Error(res.errors.map((e) => e.message).join("; "));
  }
  if (!res.data) throw new Error("Shopify returned no data");
  return res.data;
}

async function getCartId(): Promise<string | null> {
  const store = cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function setCartId(id: string) {
  cookies().set(CART_COOKIE, id, COOKIE_OPTS);
}

async function clearCartId() {
  cookies().delete(CART_COOKIE);
}

async function ensureCart(): Promise<Cart> {
  const id = await getCartId();
  if (id) {
    try {
      const data = await call<{ cart: Cart | null }>(CART_QUERY, { id });
      if (data.cart) return data.cart;
    } catch {
      // fall through to create
    }
  }
  const data = await call<{ cartCreate: MutationResult }>(
    CART_CREATE_MUTATION,
    { input: {} }
  );
  if (data.cartCreate.userErrors.length || !data.cartCreate.cart) {
    throw new Error(
      data.cartCreate.userErrors[0]?.message || "Could not create cart"
    );
  }
  await setCartId(data.cartCreate.cart.id);
  return data.cartCreate.cart;
}

export async function getCartAction(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    const data = await call<{ cart: Cart | null }>(CART_QUERY, { id });
    if (!data.cart) {
      await clearCartId();
      return null;
    }
    return data.cart;
  } catch {
    return null;
  }
}

export async function addToCartAction(
  merchandiseId: string,
  quantity = 1
): Promise<{ cart: Cart | null; error?: string }> {
  try {
    const cart = await ensureCart();
    const data = await call<{ cartLinesAdd: MutationResult }>(
      CART_LINES_ADD_MUTATION,
      { cartId: cart.id, lines: [{ merchandiseId, quantity }] }
    );
    if (data.cartLinesAdd.userErrors.length) {
      return {
        cart: data.cartLinesAdd.cart,
        error: data.cartLinesAdd.userErrors[0].message,
      };
    }
    return { cart: data.cartLinesAdd.cart };
  } catch (err) {
    return { cart: null, error: (err as Error).message };
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number
): Promise<{ cart: Cart | null; error?: string }> {
  const id = await getCartId();
  if (!id) return { cart: null, error: "No cart" };
  try {
    const data = await call<{ cartLinesUpdate: MutationResult }>(
      CART_LINES_UPDATE_MUTATION,
      { cartId: id, lines: [{ id: lineId, quantity }] }
    );
    if (data.cartLinesUpdate.userErrors.length) {
      return {
        cart: data.cartLinesUpdate.cart,
        error: data.cartLinesUpdate.userErrors[0].message,
      };
    }
    return { cart: data.cartLinesUpdate.cart };
  } catch (err) {
    return { cart: null, error: (err as Error).message };
  }
}

export async function removeCartLineAction(
  lineId: string
): Promise<{ cart: Cart | null; error?: string }> {
  const id = await getCartId();
  if (!id) return { cart: null, error: "No cart" };
  try {
    const data = await call<{ cartLinesRemove: MutationResult }>(
      CART_LINES_REMOVE_MUTATION,
      { cartId: id, lineIds: [lineId] }
    );
    if (data.cartLinesRemove.userErrors.length) {
      return {
        cart: data.cartLinesRemove.cart,
        error: data.cartLinesRemove.userErrors[0].message,
      };
    }
    return { cart: data.cartLinesRemove.cart };
  } catch (err) {
    return { cart: null, error: (err as Error).message };
  }
}
