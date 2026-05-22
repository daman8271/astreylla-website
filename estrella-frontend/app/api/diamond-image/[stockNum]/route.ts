import { NextRequest, NextResponse } from "next/server";

// Resolves an Augmont stockNum to its real JPEG URL via the short-url API
// and 302-redirects the browser there. The Augmont diamond.image_url field
// returns an HTML viewer page (NOT an image), so <img src={image_url}> fails
// to decode.
//
// Augmont migrated its assets to Bunny CDN: the short-url API now returns a
// bare *folder* base like https://augmont-lgd-prod.b-cdn.net/products/{uuid}
// (no filename), and the still image lives at `{base}/still.jpg`. Hitting the
// bare folder 404s, which is why every card fell back to the SVG placeholder.
// We append `/still.jpg` unless the resolver already handed us a file URL
// (older gem360/diamondasset format ended in e.g. .../still.jpg directly).
//
// Cached at the edge for 24h per stockNum so we don't hammer Augmont on
// every page load.

export const runtime = "edge";
export const revalidate = 86400; // 24h

const RESOLVER = "https://diamonds-api.augmont.com/api/v1/short-url/get";

type ShortUrlResponse = {
  status?: boolean;
  message?: string;
  data?: {
    fullUrl?: string;
  };
};

export async function GET(
  _req: NextRequest,
  ctx: { params: { stockNum: string } }
) {
  const sku = (ctx.params.stockNum || "").trim();
  if (!sku) {
    return new NextResponse("missing stockNum", { status: 400 });
  }

  let json: ShortUrlResponse;
  try {
    const r = await fetch(`${RESOLVER}/${encodeURIComponent(sku)}`, {
      next: { revalidate: 86400 },
    });
    if (!r.ok) {
      return new NextResponse("resolver_unavailable", { status: 502 });
    }
    json = (await r.json()) as ShortUrlResponse;
  } catch {
    return new NextResponse("resolver_error", { status: 502 });
  }

  const target = json?.data?.fullUrl;
  if (!target || typeof target !== "string") {
    return new NextResponse("no asset", { status: 404 });
  }

  // Bunny CDN returns a folder base (no filename); the still image is at
  // `{base}/still.jpg`. Only append when the URL isn't already a file.
  const hasImageFile = /\.(jpe?g|png|webp|gif)$/i.test(target);
  const imageUrl = hasImageFile
    ? target
    : `${target.replace(/\/+$/, "")}/still.jpg`;

  return NextResponse.redirect(imageUrl, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}
