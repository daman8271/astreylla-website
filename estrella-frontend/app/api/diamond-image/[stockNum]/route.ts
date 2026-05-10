import { NextRequest, NextResponse } from "next/server";

// Resolves an Augmont stockNum to its real JPEG URL via the short-url API
// and 302-redirects the browser there. The Augmont diamond.image_url field
// returns an HTML viewer page (NOT an image), so <img src={image_url}> fails
// to decode. The short-url API gives the real underlying asset URL like
// https://video.diamondasset.in:8080/imagesM/{id}.jpg or
// https://videos.gem360.in/imaged/{path}/still.jpg
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

  return NextResponse.redirect(target, {
    status: 302,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}
