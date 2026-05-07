# estrella-frontend

Next.js 14 (App Router) marketing storefront for Estrella. Sibling to
`augmont-diamonds/` (the Remix admin app + Express API + Theme App
Extension widget). This repo only owns the public-facing storefront —
nothing in `augmont-diamonds/` is touched.

## Run locally

```bash
cd estrella-frontend
npm install
cp .env.local.example .env.local   # fill values when needed
npm run dev                         # serves on http://localhost:3001
```

Port 3001 is set explicitly to avoid colliding with Remix on 3000.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home — video hero, shape tiles, value strip, about, testimonials |
| `/diamonds` | Embeds the v15.5 diamond widget (the live one) |
| `/color-diamonds` | "Coming soon" placeholder |
| `/gemstones` | "Coming soon" placeholder |
| `/engagement` | "Coming soon" placeholder |
| `/about` | Editorial about page |

## Diamond widget embed

The existing diamond browser widget lives in
`augmont-diamonds/extensions/diamond-widget/assets/`. Two files are
copied verbatim into `public/widget/` so this Next app can serve them:

- `public/widget/diamond-widget.css`
- `public/widget/diamond-widget.js`

`<DiamondWidgetEmbed />` (client component) injects the font, CSS and JS
into the document on mount, plus a `<div id="diamond-widget-root">`
configured with `data-api-url="/api/widget"`.

### Manual sync when the widget updates

When the design session ships a new widget version (e.g. v16, v17), the
public copies in this app go stale. Re-sync with:

```bash
cp augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.css \
   estrella-frontend/public/widget/diamond-widget.css
cp augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.js  \
   estrella-frontend/public/widget/diamond-widget.js
```

Commit those changes alongside the front-end edit that depends on them.

## CORS proxy

The production Express API on Railway only allows browser requests from
`*.myshopify.com` and `admin.shopify.com`. `localhost:3001` is blocked.

To keep the browser calling a same-origin endpoint, this app proxies
through `app/api/widget/[...path]/route.ts`:

```
browser ──fetch──> /api/widget/api/public/diamonds (same origin, no CORS)
                          │
                          ▼
              Next.js server proxy
                          │
                          ▼
        Railway Express API (server-to-server)
```

Server-to-server calls have no `Origin` header, so Express's CORS check
short-circuits and lets them through. The widget's `data-api-url` is
set to `/api/widget`, so all of its `fetch` calls inherit the proxy
automatically.

When this front-end gets its own public origin (Vercel deploy), add that
origin to the Express server's CORS allowlist and the proxy can be
swapped for direct calls if desired.

## Environment

| Var | Purpose |
| --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Storefront API target (server-only, currently unused) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Storefront API token (currently unused — scaffolded for future product queries) |
| `NEXT_PUBLIC_DIAMOND_WIDGET_API_URL` | Express upstream for the `/api/widget/*` proxy |

`lib/shopify.ts` exports a Storefront API client and a placeholder
`PRODUCTS_QUERY`. Nothing calls them yet — the scaffold is in place
so a future iteration can add product surfaces (rings, settings)
without re-bootstrapping the SDK.

## Asset placeholders

Real assets land later. Skeleton ships referencing these filenames:

| Path | What to drop in |
| --- | --- |
| `public/hero-loop.mp4` | Hero video loop (use `public/hero-loop.webm` too if available) |
| `public/hero-poster.svg` | Already present — charcoal placeholder. Replace with a real poster image (jpg/png/svg) when the video lands |

The video falls back to the SVG poster when:
- the file doesn't exist (current state)
- the user prefers reduced motion

## Tech

- Next.js 14 (App Router, server components by default)
- TypeScript strict mode
- Tailwind CSS v3 + CSS custom properties for design tokens
- next/font/google for Source Serif 4 / Italiana / Instrument Sans
- `lucide-react` for icons (Instagram/X are inlined SVGs because the
  installed lucide build doesn't export them)
- `@shopify/storefront-api-client` scaffolded, no queries called

## Don't touch

- `augmont-diamonds/` (Remix admin + Theme App Extension widget)
- `server/` (Express API on Railway)
- `prisma/`, root `.env`, `shopify.app.toml`
- The widget files under `augmont-diamonds/extensions/diamond-widget/`
  — copy out, don't edit in place.
