import "server-only";
import {
  shopifyClient,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  CART_QUERY,
  type ProductCard,
  type ProductDetail,
  type Cart,
} from "./shopify";

type GqlResult<T> = { data?: T; errors?: { message: string }[] };

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  cache?: { revalidate?: number; tags?: string[]; cache?: RequestCache }
): Promise<T> {
  const res = (await shopifyClient.request(query, {
    // @ts-expect-error - SDK overload narrows TVariables to never without an explicit generic; safe at runtime
    variables,
    // @ts-expect-error - storefront client passes through fetch options
    next: cache,
  })) as GqlResult<T>;

  if (res.errors?.length) {
    throw new Error(res.errors.map((e) => e.message).join("; "));
  }
  if (!res.data) {
    throw new Error("Shopify Storefront API returned no data");
  }
  return res.data;
}

export async function fetchProducts(opts: {
  first?: number;
  sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED_AT" | "UPDATED_AT";
  reverse?: boolean;
  query?: string;
} = {}): Promise<ProductCard[]> {
  const data = await gql<{
    products: { edges: { node: ProductCard }[] };
  }>(
    PRODUCTS_QUERY,
    {
      first: opts.first ?? 24,
      sortKey: opts.sortKey ?? "BEST_SELLING",
      reverse: opts.reverse ?? false,
      query: opts.query ?? null,
    },
    { revalidate: 60, tags: ["products"] }
  );
  return data.products.edges.map((e) => e.node);
}

export async function fetchProductByHandle(
  handle: string
): Promise<ProductDetail | null> {
  const data = await gql<{ product: ProductDetail | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { revalidate: 60, tags: ["products", `product:${handle}`] }
  );
  return data.product;
}

export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await gql<{ cart: Cart | null }>(
    CART_QUERY,
    { id: cartId },
    { cache: "no-store" }
  );
  return data.cart;
}
