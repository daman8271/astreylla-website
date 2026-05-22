# 💎 Astreylla — Website & Diamond App

This repository (`astreylla-website`) holds **two separate codebases** for the
**Astreylla** lab-grown diamond brand. There is **no root `package.json`** — the
repo root is a container; each codebase is installed and run from its own folder.

| Path | What it is | Status |
|------|-----------|--------|
| **[`estrella-frontend/`](estrella-frontend/)** | **★ The active project** — a Next.js 14 marketing storefront + ring builder. Deploys to **Vercel**. | **Where day-to-day work happens.** Live ↓ |
| [`augmont-diamonds/`](augmont-diamonds/) | The older **Shopify embedded app** — Remix admin (Polaris) + Express API + Prisma/Supabase + a Theme App Extension diamond widget. Deploys to **Railway**. | Stable / maintenance mode. |

**🌐 Live site:** https://estrella-frontend.vercel.app

> **A note on naming.** The brand has been renamed over the project's life:
> **"Payal Diamond"** (earliest docs) → **"Estrella"** (the `estrella-frontend`
> folder) → **"Astreylla"** (current brand + repo name). They all refer to the
> same business — **Astreylla is the current name.**

---

## 📁 Repository layout

```
astreylla-website/
├── estrella-frontend/        ★ Next.js 14 website (active, deploys to Vercel)
├── augmont-diamonds/         Shopify app: Remix admin + Express API + Prisma + widget
│                             (server/, prisma/, app/, extensions/ all live here)
├── CLAUDE.md                 AI working contract + hard-won lessons (read first)
├── PROJECT_MASTER.md         Shopify-app source of truth (API docs, phases)
├── WORK_LOG.md               Session-by-session build history
├── PAYAL_HANDOFF.md          Outstanding items needing the merchant's action
├── PHASE_C_EXECUTION_PLAN.md / PHASE_E_BACKLOG.md   Shopify-app planning docs
├── .env.example
└── README.md                 This file
```

---

## ★ estrella-frontend — the Astreylla website

Next.js 14 (App Router) marketing storefront and multi-step ring builder.
TypeScript, Tailwind CSS v3, server components by default. Deploys to Vercel.

### Run locally

```bash
cd estrella-frontend
npm install
npm run dev          # http://localhost:3001  (3001 to avoid the Remix app's 3000)
```

| Script | Does |
|--------|------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Next.js lint |

### Routes

| Path | Page |
|------|------|
| `/` | Home — hero, shape tiles, sale strip, best sellers, Ring Studio entry |
| `/diamonds` | Live diamond catalog (embeds the Shopify diamond widget) |
| `/products/[handle]` | Product detail |
| `/ring-studio` → `/ring-studio/setting` → `/ring-studio/diamond` → `/ring-studio/complete` | Multi-step ring builder: choose setting → diamond → review |
| `/color-diamonds` | Fancy (color) diamonds — **placeholder, "Coming soon"** |
| `/gemstones` | Gemstones — **placeholder, "Coming soon"** |
| `/engagement` | Engagement landing |

### API routes (`app/api/`)

| Route | Purpose |
|-------|---------|
| `api/widget/[...path]` | Same-origin CORS proxy → the Railway Express API (lets the browser call the diamond widget without CORS) |
| `api/diamond-image/[stockNum]` | Diamond image resolver/proxy |
| `api/ring-quotes` | Ring price quoting |

### Structure

- `app/` — routes (App Router)
- `components/` — `nav`, `hero`, `sale-strip`, `shape-tiles`, `category-tiles`,
  `best-sellers`, `express-band`, `value-strip`, `diamonds`, `ring-studio`,
  `products`, `cart`, `footer`, `theme` (dark mode), `widget-embed`
- `lib/` — `design-tokens`, `ringQuote`, `ringSizes`, `cart-actions`,
  `settings`, Shopify clients (`shopify.ts`, `shopify-server.ts`)
- `public/` — assets, shape/ring-style mask icons, and the copied widget files

### Diamond widget

The diamond browser widget is **copied verbatim** from
`augmont-diamonds/extensions/diamond-widget/assets/` into `public/widget/`.
**Copy out — don't edit it in place.** Re-sync when the widget updates (see
[`estrella-frontend/README.md`](estrella-frontend/README.md) for the exact `cp`
commands and the CORS-proxy explanation).

### Deploy (Vercel)

The Vercel project (`estrella-frontend`) is linked locally via
`estrella-frontend/.vercel/`. From `estrella-frontend/`:

```bash
vercel            # preview deploy
vercel --prod     # production deploy → https://estrella-frontend.vercel.app
```

---

## augmont-diamonds — the Shopify app (stable)

Shopify embedded app that lets independent jewellers sell a wholesale lab-grown
diamond catalog from their own storefront. Jewellers install the app → customers
browse diamonds via a Theme Extension widget → orders flow to the supplier's live
API → the supplier ships.

**Stack:** Remix + Shopify Polaris (admin) · App Bridge + Session Tokens (auth) ·
GraphQL Admin API · Node.js + Express (the bridge to the supplier API) ·
Prisma ORM · PostgreSQL on Supabase · **Railway** hosting · Shopify CDN for the
Theme Extension.

This codebase is in **maintenance mode** — the website is the focus. Its full
architecture, API reference, environment variables, database setup, and
deployment notes live in **[`PROJECT_MASTER.md`](PROJECT_MASTER.md)**,
**[`CLAUDE.md`](CLAUDE.md)**, and
[`augmont-diamonds/README.md`](augmont-diamonds/README.md).

> **Don't touch from website work:** `augmont-diamonds/`, root `.env`,
> `shopify.app.toml`, and the widget source under
> `augmont-diamonds/extensions/diamond-widget/`.

---

## 📚 Where things are documented

| Doc | Covers |
|-----|--------|
| [`CLAUDE.md`](CLAUDE.md) | Working contract for AI assistants + the repo's hard-won lessons (Prisma/Supabase, Augmont API, deploy gotchas). Read this first. |
| [`estrella-frontend/README.md`](estrella-frontend/README.md) | Website specifics: widget sync, CORS proxy, env vars, assets |
| [`PROJECT_MASTER.md`](PROJECT_MASTER.md) | Shopify-app source of truth (API docs, build phases) |
| [`WORK_LOG.md`](WORK_LOG.md) | Session-by-session build history |
| [`PAYAL_HANDOFF.md`](PAYAL_HANDOFF.md) | Items waiting on the merchant (e.g. Augmont feature flags) |

---

## 📄 License

Proprietary. All rights reserved. Built for Astreylla; not licensed for
redistribution, modification, or commercial use by third parties without prior
written consent.
