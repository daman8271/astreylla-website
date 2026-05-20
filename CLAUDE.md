# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Read this ENTIRE file before doing ANYTHING.
> Zero code until this is fully read.

## ⚠️ REPO ORIENTATION — READ FIRST
This repo (`astreylla-website`) holds **two separate codebases**. There is **no root `package.json`** — the root is just a container.

| Path | What it is | Status |
|------|-----------|--------|
| **`estrella-frontend/`** | **★ THE ACTIVE PROJECT — a Next.js 14 website** (App Router, TypeScript, Tailwind v3). Marketing storefront + ring builder for the **Astreylla / Estrella** brand. Deploys to **Vercel** (`vercel.json`). | **Where ~all current work happens.** |
| `augmont-diamonds/` + `server/` + `prisma/` | The older **Shopify embedded app** (React Router/Remix admin + Express API + Theme Extension widget) for the diamond-wholesale flow. Built, deployed to Railway, **stable / maintenance mode**. | Mostly untouched now. |

**Brand naming has drifted across the repo:** "Payal Diamond" (old root docs) → "Estrella" (`estrella-frontend`) → **"Astreylla"** (repo name + recent commits). They all refer to the same business; **Astreylla is the current brand.**

> **Everything in this file BELOW this section documents the `augmont-diamonds/` Shopify app**, not the Next.js website. The hard-won lessons (Prisma/Supabase, Augmont API, currency, deploy gotchas) still apply to that sibling app and to the widget the website reuses — but the day-to-day work is in `estrella-frontend/`.

### estrella-frontend/ at a glance
- **Run:** `cd estrella-frontend && npm install && npm run dev` → http://localhost:3001 (port 3001 to avoid the Remix app's 3000).
- **Routes:** `/` (home — hero, shape tiles, sale strip, best sellers), `/diamonds` (embeds the live diamond widget), `/ring-studio/*` (multi-step ring builder: choose setting → diamond → complete), `/products/[handle]`, plus `/color-diamonds` `/gemstones` `/engagement` placeholders.
- **API routes (`app/api/`):** `widget/[...path]` (CORS proxy → Railway Express), `diamond-image/[stockNum]`, `ring-quotes`.
- **Structure:** `app/` (routes), `components/` (nav, hero, sale-strip, ring-studio, cart, theme/dark-mode, widget-embed, …), `lib/` (design-tokens, ringQuote, ringSizes, cart-actions, shopify clients), `public/` (assets + copied widget files).
- **Diamond widget:** copied verbatim from `augmont-diamonds/extensions/diamond-widget/assets/` into `public/widget/`. Re-sync on widget updates (see `estrella-frontend/README.md`). **Copy out — don't edit in place.**
- **Don't touch from website work:** `augmont-diamonds/`, `server/`, `prisma/`, root `.env`, `shopify.app.toml`.

---

## PROJECT (the `augmont-diamonds/` Shopify app — sibling, stable)
Shopify embedded app for Payal (diamond wholesaler).
Jewellers install app → customers browse diamonds on jeweller's store
→ orders flow to Payal's existing live API → she ships.

## DEVELOPER
Divyanshu Sharma. Vibe coder — I direct, you build.
One task per session. Explain what you're doing. Test before moving on.
Never stack multiple features in one session.

## TECH STACK
- Framework:    Remix + React + Shopify CLI
- Admin UI:     Shopify Polaris (mandatory, no custom UI)
- Auth:         OAuth 2.0 + Session Tokens + App Bridge 3.0
- Queries:      GraphQL Admin API
- Backend:      Node.js + Express (our bridge to Payal's API)
- Database:     PostgreSQL on Supabase via Prisma ORM
- Hosting:      Railway (Remix app + Express API)
- CDN:          Shopify hosts /extensions automatically

## RULES — NON-NEGOTIABLE
1. One task per session. Stop when it's done.
2. Read the file before editing it.
3. Tell me exactly what changed after every task.
4. If something might break existing work — STOP, ask first.
5. Never install a new package without explaining why.
6. After every working feature — remind me to git commit.
7. Test what you built. Don't declare done without testing.
8. If stuck — say so. Don't hallucinate a solution.

## CRITICAL KNOWLEDGE — read this every session
> Each rule below is a bug that already burned us. If you find yourself about to do the wrong thing, stop and re-read.

### 1. Prisma + Supabase PgBouncer rule
- **`DATABASE_URL`** points at Supabase's pooler (`pooler.supabase.com:6543`, transaction pooling). It **must** include `?pgbouncer=true&connection_limit=1`. Without `pgbouncer=true`, Prisma's prepared statements collide across recycled backend connections and every query starts returning `prepared statement "s6" already exists` (PG code `42P05`) once connections cycle.
- **`DIRECT_URL`** points at the direct, non-pooled port (`5432`) and **must NOT** have those flags. `prisma migrate` runs through `DIRECT_URL` and needs real prepared statements.
- Setting these via `railway variables --set` triggers a redeploy. Verify via `railway run -- node -e "console.log(new URL(process.env.DATABASE_URL).searchParams.toString())"`.
- Symptom: API works fresh after `railway up` then 500s once warmed up. If you see that pattern, check the URL params first.

### 2. `shopify app deploy` ≠ theme rebind
- `shopify app deploy` releases a new app version to Shopify CDN. It **does not** rewrite theme blocks already bound to a previous (especially `dev-`) asset URL.
- If you ever ran `shopify app dev` and added a block to a theme via the dev-server preview UI, the theme template JSON now hard-codes a `dev-{uuid}` asset URL. That URL is a frozen snapshot — `shopify app deploy` cannot move it.
- **Always run `shopify app dev clean --store <shop>` when ending a dev session.** It "restores the app's active version to the selected development store."
- **Add Theme Editor blocks via the Apps section, not via `shopify app dev` preview UI** — the latter creates a permanent dev-URL binding that survives forever.
- If a storefront mysteriously shows old code despite a successful `shopify app deploy`: curl the storefront, grep for the asset URL, look for `dev-` in the path. If present, you need `app dev clean` + Theme Editor rebind, not another deploy.

### 3. Augmont image URLs are HTML, not images
- `image_url` from `/merchant/products` looks like `https://www.viewmydiamonds.com/?id={stockNum}&type=image` — that's an **HTML viewer page** (Content-Type: `text/html`, ~20 KB), not a JPEG/PNG.
- An `<img src="...">` pointing at this fails to decode → broken image icon → alt text shown.
- **Always wire an `onerror` handler** on the `<img>` that swaps to the gold-gradient placeholder with shape label. See `extensions/diamond-widget/assets/diamond-widget.js` (`buildPlaceholder()`).
- These URLs are also slow (S3 + CloudFront miss on first hit per stone). Lazy-load with `loading="lazy"`.

### 4. Currency formatting — never hardcode the symbol
- Augmont returns a `currency` field on cart responses (`USD` for UAT, who knows for prod). The widget reads it.
- Render with `Intl.NumberFormat('en-US', { style: 'currency', currency: ccy })` via the `formatMoney(amount, currency)` helper. Renders `$43.43` / `₹3,543` / `£99.50` correctly without any hardcoded symbol.
- If you find yourself typing `'$' +` or `'₹' +`, stop and use `formatMoney()` instead.

### 5. Augmont feature flags block end-to-end
- Two server-side flags on Payal's Augmont merchant account gate functionality:
  - `cart_api_enabled` (currently believed ON) — blocks `POST /merchant/cart/add`
  - `auto_order_enabled` (currently OFF on UAT) — blocks `POST /merchant/order/create`
- Server maps Augmont 403 → HTTP 503 with friendly user-facing message. Cart works, checkout shows "Online checkout is not yet enabled."
- Don't waste cycles debugging the order flow until the flag is verified ON. See `PAYAL_HANDOFF.md` at repo root.

### 6. Preview env shares the production Supabase database
- Both Railway environments (preview AND production) currently point at the SAME Supabase project — identical `DATABASE_URL` and `DIRECT_URL`, same pooler host (`aws-1-ap-southeast-1.pooler.supabase.com:6543`), same credentials, same data.
- Confirmed May 3, 2026 via `railway variables --environment production --kv` vs `--environment preview --kv` (both returned identical URLs).
- **Implication: preview is NOT a real staging tier.** Stress tests on preview hit prod data. `prisma migrate deploy` on preview applies to the production DB. Destructive queries on preview destroy production state.
- **What to do:**
  - Treat any infra-touching operation on preview as production-impacting.
  - Don't `prisma migrate dev --create-only` then push through preview without confirming the migration is safe for production data.
  - Don't run capacity tests against preview hoping to shield production — there's no shielding.
  - When testing changes that need pool/connection isolation (e.g. raising `connection_limit`), there is currently no safe path; provision a dedicated preview Supabase project first (tracked in `PHASE_E_BACKLOG.md`).

## COMMANDS

```bash
# After running: shopify app init (choose Remix template)

# Local dev — canonical command (skips redundant dep install)
shopify app dev --skip-dependencies-installation

# Plain shopify app dev still works but is slower on cold start
shopify app dev

# Or run Remix directly (no tunnel)
npm run dev

# Start Express API server only (from /server)
node server/index.js

# Prisma — apply schema changes
npx prisma migrate dev --name <migration_name>

# Prisma — open DB browser
npx prisma studio

# Deploy to Railway
railway up
```

## LIVE DEPLOYMENT

- **Railway API URL:** `claude-code-max-shopify-app-production.up.railway.app`
- **Health check:** `https://claude-code-max-shopify-app-production.up.railway.app/health` → 200
- **Active theme extension version:** `augmont-diamonds-5` (released May 1, 2026 — has cart + checkout + image fallback + currency formatter)
- **Admin dashboard:** 4 Polaris pages (home, diamonds, orders, settings) — embedded in Shopify Admin via App Bridge
- **Storefront widget:** deployed via Shopify CDN, talks directly to Express on Railway
- **Test storefront:** `trial-shop-sqxnl71f.myshopify.com` (password: <stored in 1Password / .env.local>)

## ARCHITECTURE

Two co-deployed services talk to each other at runtime:

```
[Shopify Admin]──OAuth──► [Remix app :3000]──fetch──► [Express API :4000]──► [Payal's API]
                                │                              │
                           [App Bridge]                  [Prisma ORM]
                                                              │
                                                       [Supabase Postgres]

[Merchant storefront]──► [Theme Extension JS]──fetch──► [Express API :4000]
```

**Remix app** (`app/`) handles everything Shopify-side: OAuth install flow, session tokens, admin UI via Polaris, and re-exports routes that Shopify CLI expects (`auth.$.jsx`, `webhooks.jsx`). It never talks to Payal's API directly — it always proxies through the Express server via `utils/api.server.js`.

**Express API** (`server/`) is the sole integration point with Payal. It verifies Shopify session tokens on every request (`middleware/auth.js`), calls Payal's API (`services/payalApi.js`), stores orders/merchants in Postgres, and handles all three mandatory GDPR webhooks. This server must be reachable by both the Remix app and the storefront Theme Extension.

**Theme Extension** (`extensions/diamond-widget/`) is vanilla JS + Liquid deployed via Shopify's CDN. The JS widget calls Express `/api/diamonds` directly from the buyer's browser — it bypasses the Remix app entirely.

**Key constraint:** Both servers must be running and reachable during development. Shopify CLI tunnels only the Remix app; the Express server needs its own public URL (use Railway or a second tunnel like `ngrok`).

## FOLDER STRUCTURE
payal-diamond-app/
├── app/                          Remix app (admin dashboard)
│   ├── routes/
│   │   ├── app._index.jsx        Dashboard home
│   │   ├── app.settings.jsx      Jeweller settings
│   │   ├── app.orders.jsx        Orders view
│   │   ├── app.diamonds.jsx      Diamond catalog
│   │   ├── auth.$.jsx            OAuth callback (auto-gen)
│   │   └── webhooks.jsx          GDPR + billing webhooks
│   ├── components/
│   │   ├── DiamondTable.jsx
│   │   ├── DiamondFilters.jsx
│   │   ├── OrdersList.jsx
│   │   ├── SettingsForm.jsx
│   │   └── BillingBanner.jsx
│   └── utils/
│       ├── api.server.js         Calls our Express API
│       └── shopify.server.js     Shopify config (auto-gen)
├── extensions/
│   └── diamond-widget/
│       ├── blocks/
│       │   └── diamond-browser.liquid
│       ├── assets/
│       │   ├── diamond-widget.js
│       │   └── diamond-widget.css
│       └── shopify.extension.toml
├── server/                       Express API — you build this entirely
│   ├── routes/
│   │   ├── diamonds.js           GET /api/diamonds (calls Payal)
│   │   ├── orders.js             POST /api/orders
│   │   ├── billing.js            POST /webhooks/billing
│   │   └── gdpr.js               3 mandatory GDPR endpoints
│   ├── middleware/
│   │   ├── auth.js               Session token verification
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── payalApi.js           Connects to Payal's existing API
│   │   ├── shopifyApi.js         GraphQL calls to Shopify
│   │   └── prismaClient.js       DB connection
│   └── index.js                  Express entry point
├── prisma/
│   ├── schema.prisma             All 4 DB tables
│   └── migrations/               Auto-generated — never touch
├── .env                          NEVER commit
├── .env.example                  Commit this (no real values)
├── shopify.app.toml              Shopify config + API scopes
├── Procfile                      Railway start command
├── package.json
├── CLAUDE.md                     This file
├── WORK_LOG.md                   → See WORK_LOG.md for session history
└── PROJECT_MASTER.md             → See PROJECT_MASTER.md for full API docs

## DATABASE TABLES
sessions:      id, shop, access_token, scope, created_at
merchants:     id, shop_id(fk), plan, is_active, widget_enabled
orders:        id, shop, customer_email, diamond_id, diamond_details(json), status, shopify_order_id, payal_order_id, created_at
subscriptions: id, shop, shopify_charge_id, plan_name, status, trial_ends_at, billing_on, created_at

## EXPRESS ROUTES
GET  /health
GET  /auth/callback
POST /webhooks/customers/redact
POST /webhooks/shop/redact
POST /webhooks/customers/data_request
GET  /api/diamonds
GET  /api/diamonds/:id
POST /api/orders
POST /webhooks/billing

## PAYAL'S EXISTING API
Base URL:  [FILL IN FROM BHAIYA]
Auth:      [FILL IN]
Diamonds:  [FILL IN]
Orders:    [FILL IN]

## ENV VARIABLES NEEDED
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SCOPES=read_products,write_orders
DATABASE_URL=
PAYAL_API_URL=
PAYAL_API_KEY=
SESSION_SECRET=
PORT=4000

## BUILD STATUS → see WORK_LOG.md
Phase 1: App init + DB + OAuth          [COMPLETE — Apr 29, 2026]
Phase 2: GDPR webhooks + auth           [COMPLETE — Apr 29, 2026]
Phase 3: Express API + Payal API        [COMPLETE — Apr 29, 2026]
Phase 4: Theme Extension widget         [COMPLETE — augmont-diamonds-5 active]
Phase 5: Order flow end to end          [COMPLETE — enquiry flow live]
Phase 6: Billing API                    [COMPLETE]
Phase 7: Testing + polish               [COMPLETE — Playwright harness in playwright-tests/]
Phase A: Real Augmont LGD integration   [COMPLETE — Apr 30, 2026]
Phase B: Cart + checkout                [COMPLETE — May 1, 2026 — browser-verified, ~$91.12 test order]
Phase C: Security hardening (Codex)     [NOT STARTED — Day 3]
Phase 8: App Store submit               [NOT STARTED — pending listing assets]

Overall: ~95% complete. Deadline May 28, 2026 — 27 days of buffer.

## OUTSTANDING
- Augmont `auto_order_enabled` flag — Payal needs to flip in merchant portal. See `PAYAL_HANDOFF.md`.
- Phase C — Codex audit fixes (Day 3 scope).
- App Store submission: listing copy, screenshots, privacy policy URL, support URL, then submit via Partner Dashboard.

## LESSONS LEARNED — read every session
> Consolidated discoveries from Phases C, D, E. Each item is a mistake we
> already made or narrowly avoided. Read this list before starting work
> so the same mistakes don't repeat.

### Testing & Verification
1. **Test behaviors, not implementation details.** Prisma 6 minifies its runtime, so `instance.constructor.name === "PrismaClient"` returns `"r"`. Use `typeof instance.session === "object"` instead — behavioral checks survive library upgrades and minification.
2. **Reference identity tests are the gold standard for singleton verification.** `const a = (await import(...)).default; const b = (await import(...)).default; assert(a === b)` is more valuable than 50 indirect tests.
3. **Tier your smoke tests:** Tier A pure unit (no HTTP), Tier B isolated HTTP harness, Tier C real-server regression. Each tier isolates a different failure mode.
4. **Grep before deleting env vars.** Always run a catch-all substring grep across `server/` and `app/` before removing any environment variable. Past sessions almost deleted `SHOPIFY_APP_URL` which was used via `||` fallback.

### Deployment & Infrastructure
5. **Always run `shopify app dev clean` after `shopify app dev` sessions.** Otherwise theme blocks bind to a `dev-{uuid}` asset URL that survives forever. Symptom: `shopify app deploy` succeeds but storefront still shows old code.
6. **Add Theme Editor blocks via the Apps section, NOT via `shopify app dev` preview UI.** The latter creates a permanent dev-URL binding.
7. **Railway `railway up --ci` may hit GraphQL subscription timeouts.** The CLI loses connection but server-side build often completes. Verify by probing `/health` + checking logs for new code markers — don't blindly retry.
8. **Railway deploy must run from REPO ROOT, not `augmont-diamonds/`.** Railway `rootDirectory` config expects the subfolder structure.
9. **Preview env shares the production Supabase project (bug #6).** Any infra-touching change to preview affects production data. No isolation for testing P3-class changes until a dedicated preview Supabase project is provisioned.

### Augmont API Behavior
10. **Augmont UAT is unreliable.** 60-120s response times are common. Total outages happen. Design for it: P1 cache + P2 timeout + friendly 503 fallback.
11. **Augmont returns viewer-page URLs, not raw images.** `viewmydiamonds.com/?id=X&type=image` is HTML, not JPEG. Always wire an `onerror` placeholder.
12. **Augmont `auto_order_enabled` flag must be enabled on Payal's merchant portal** for checkout to work end-to-end. Cart works without it; checkout returns 403 → mapped to friendly 503.
13. **Production Augmont catalog has 700K+ diamonds vs UAT's 25.** Pagination is mandatory before production migration. Don't render full catalog in any UI.

### Database (Prisma + Supabase)
14. **`DATABASE_URL` needs `?pgbouncer=true&connection_limit=1`.** Without `pgbouncer=true`, Prisma's prepared statements collide across recycled PgBouncer connections (PG code 42P05).
15. **`DIRECT_URL` stays clean (no pgbouncer flag).** It's used by `prisma migrate` which needs real prepared statements.
16. **Single Prisma client via `global.__prismaSingleton`** — both `server/services/prismaClient.js` and `app/db.server.js`. Vite inlines bundled imports, so the ESM module cache can't dedupe. `globalThis` is the canonical Prisma+Remix pattern.

### Workflow Discipline
17. **One commit per fix.** Don't bundle drive-by improvements into unrelated commits. Note them, ship them later.
18. **Design plan required for medium/high risk items.** Speed mode (skip design plan) is OK for simple UI wires but never for infra/security changes.
19. **`prisma migrate deploy` runs on every Railway boot.** Means migrations execute against the same prod DB whether you deploy to preview or production. Treat any destructive migration as production-impacting.
20. **`.env.example` was silently gitignored** until C4 fixed it with `!.env.example` negation. Always check `git check-ignore -v <file>` for any file that should be tracked but seems missing.

### Communication
21. **When a safety gate fires on something cosmetic (e.g., bad assertion), STOP and explain.** User decides: proceed, fix the test, or rollback. Never silently bypass a gate.
22. **Approval gates between every commit.** Show diff, smoke results, commit message — wait for "commit" approval. Even in speed mode.

### Specific Pitfalls to Avoid
23. **Never log raw customer emails** — hash with SHA-256 prefix + `.toLowerCase().trim()` normalization.
24. **Never echo `err.message` in 5xx production responses** — opaque `"Something went wrong"` + `requestId` only.
25. **Never ping Augmont on Settings page load** — env-var presence check is sufficient. Live ping is a 60-120s footgun.
26. **Never assume meeting/conversation context is in transcript by default.** User has to paste recording/notes manually.

### Railway env-var deploy gotcha (Day 5 / F1.5)
27. **Railway env-var changes auto-redeploy from the service's configured Git source, NOT from a prior `railway up` snapshot.** If you've been deploying via `railway up --ci` (manual snapshot from current branch HEAD), the configured Git source on the Railway dashboard may be pinned to an older commit. Setting any env var triggers a rebuild from THAT older commit, silently reverting production code state. **Symptom**: response headers + log markers from recent commits go missing (e.g., the `X-Request-Id` header from C2, the `[prisma] singleton initialized` line from C3); fake-shop probes still get 403 (older Phase D code present), but newer commits aren't there. **Fix**: after any production env-var change, verify code freshness via response headers and log markers; if regressed, force-deploy with `railway up --ci` from REPO ROOT to overwrite. **Better long-term**: align the Railway dashboard's source ref with the branch you actually deploy from. (Discovered May 5, 2026 during F1.5 prod Augmont swap — full incident in WORK_LOG.md Day 5 late evening entry.)
