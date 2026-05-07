import { NextRequest } from "next/server";

const UPSTREAM =
  process.env.NEXT_PUBLIC_DIAMOND_WIDGET_API_URL ||
  "https://claude-code-max-shopify-app-production.up.railway.app";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "accept-encoding",
]);

async function proxy(req: NextRequest, ctx: { params: { path: string[] } }) {
  const subpath = (ctx.params.path || []).join("/");
  const search = req.nextUrl.search || "";
  const target = `${UPSTREAM.replace(/\/$/, "")}/${subpath}${search}`;

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers: stripHeaders(req.headers),
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "upstream_unreachable",
        message: (err as Error).message,
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const headers = new Headers();
  upstream.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

function stripHeaders(headers: Headers): Headers {
  const out = new Headers();
  headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) out.set(k, v);
  });
  out.delete("origin");
  out.delete("referer");
  out.delete("cookie");
  return out;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
