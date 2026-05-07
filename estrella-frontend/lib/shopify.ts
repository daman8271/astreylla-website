import { createStorefrontApiClient } from "@shopify/storefront-api-client";

export const shopifyClient = createStorefrontApiClient({
  storeDomain:
    process.env.SHOPIFY_STORE_DOMAIN || "trial-shop-sqxnl71f.myshopify.com",
  apiVersion: "2024-10",
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "",
});

export const PRODUCTS_QUERY = `#graphql
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText }
        }
      }
    }
  }
`;
