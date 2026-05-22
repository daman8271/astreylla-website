// Direct Bunny CDN still-image URL for an Augmont diamond.
//
// Every diamond's `id` IS its product folder on the CDN: the Augmont short-url
// resolver (`short-url/get/{stockNum}`) only ever maps a stockNum to
// `{base}/{id}`, and the still image lives at `{base}/{id}/still.jpg`. Building
// the URL directly from the `id` we already have lets the browser load the
// photo straight from the CDN — skipping the per-image resolver round-trip
// (an Augmont API call that intermittently failed under the ~12 concurrent
// requests a catalog page fires, leaving random cards on the placeholder) and
// the extra `/api/diamond-image` redirect hop (whose 24h `immutable` cache
// could pin a stale 404 from before this fix).
//
// Falls back to the SVG placeholder via the <img> onError handler for the rare
// stone whose asset is genuinely missing.
const CDN_BASE =
  process.env.NEXT_PUBLIC_AUGMONT_CDN ||
  "https://augmont-lgd-prod.b-cdn.net/products";

export function diamondImageUrl(id?: string): string {
  if (!id) return "";
  return `${CDN_BASE}/${encodeURIComponent(id)}/still.jpg`;
}
