import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const storeDomain =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "trial-shop-sqxnl71f.myshopify.com";

const publicAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_TOKEN ||
  "";

// Lazy + tolerant: createStorefrontApiClient throws on construction when
// publicAccessToken is empty. Building this module at top level means any
// preview environment missing the env var fails the entire `next build`
// (including unrelated pages, via shared chunks like _not-found). Defer
// construction until first use; pages that don't call into Shopify build
// and run fine, and Shopify-dependent routes still error loudly at request
// time when the token is missing.
type ShopifyClient = ReturnType<typeof createStorefrontApiClient>;
let _client: ShopifyClient | null = null;

function getClient(): ShopifyClient {
  if (_client) return _client;
  if (!publicAccessToken) {
    throw new Error(
      "Shopify Storefront token is not configured. Set NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN."
    );
  }
  _client = createStorefrontApiClient({
    storeDomain,
    apiVersion: "2025-10",
    publicAccessToken,
  });
  return _client;
}

export const shopifyClient: ShopifyClient = new Proxy({} as ShopifyClient, {
  get(_t, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});

export type Money = { amount: string; currencyCode: string };

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  availableForSale: boolean;
};

export type ProductDetail = ProductCard & {
  descriptionHtml: string;
  options: { id: string; name: string; optionValues: { id: string; name: string }[] }[];
  images: {
    edges: { node: { url: string; altText: string | null; width: number | null; height: number | null } }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        quantityAvailable: number | null;
        selectedOptions: { name: string; value: string }[];
        price: Money;
        compareAtPrice: Money | null;
        image: { url: string; altText: string | null } | null;
      };
    }[];
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money; amountPerQuantity: Money };
  merchandise: {
    id: string;
    title: string;
    image: { url: string; altText: string | null } | null;
    price: Money;
    product: { id: string; handle: string; title: string };
    selectedOptions: { name: string; value: string }[];
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
  };
  lines: { edges: { node: CartLine }[] };
};

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage { url altText }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
  }
`;

export const PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        cursor
        node { ...ProductCard }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductCard
      descriptionHtml
      options { id name optionValues { id name } }
      images(first: 10) {
        edges { node { url altText width height } }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions { name value }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText }
          }
        }
      }
    }
  }
`;

const CART_FRAGMENT = `#graphql
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount { amount currencyCode }
            amountPerQuantity { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText }
              price { amount currencyCode }
              product { id handle title }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  }
`;

export const CART_QUERY = `#graphql
  ${CART_FRAGMENT}
  query GetCart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
`;

export const CART_CREATE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message code }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `#graphql
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message code }
    }
  }
`;

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return "";
  const amount = parseFloat(money.amount);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}
