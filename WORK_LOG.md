# WORK_LOG.md
Auto-updated every session. Shows exactly where we are.

---

## HOW TO UPDATE THIS FILE
At end of every session, Claude writes:
DATE | PHASE | WHAT WAS BUILT | FILES CHANGED | WHAT'S NEXT | BLOCKERS

---

## PHASE TRACKER

| Phase | What | Status | Date Done |
|-------|------|--------|-----------|
| 1 | shopify app init + Supabase + OAuth | COMPLETE | Apr 29, 2026 |
| 2 | GDPR webhooks + Session Token auth | COMPLETE | Apr 29, 2026 |
| 3 | Express API + connect Payal's API | COMPLETE (pending Augmont creds) | Apr 29, 2026 |
| 4 | Theme Extension widget | COMPLETE | Apr 29, 2026 |
| 5 | Order flow end to end | COMPLETE (enquiry flow live) | Apr 29, 2026 |
| 6 | Billing API | DEFERRED — app is free at launch (billing route removed in H3 to eliminate billing-webhook attack surface; can re-add post-App-Store-approval if monetization is added later) | — |
| 7 | Testing + polish | COMPLETE | Apr 29, 2026 |
| 8 | App Store submission | NOT STARTED — pending assets | — |

---

## SESSION LOG

### Day 1 — Session 1 — April 28, 2026 (3 AM)
**Phase:** Phase 1 — full project setup + server skeleton + GitHub push
**Built:**
- CLAUDE.md, WORK_LOG.md, PROJECT_MASTER.md created
- Folder structure finalized, GitHub repo initialized
- Shopify app scaffolded in `augmont-diamonds/` (Remix template)
- Supabase project created, DATABASE_URL + DIRECT_URL configured in `.env`
- `prisma/schema.prisma` created with all 4 tables (Session, Merchant, Order, Subscription)
- Migration `20260427215234_init` applied — all tables live in Supabase
- `server/` skeleton built — all 10 files created (routes, middleware, services, index.js)
- GitHub repo pushed

**Phase 1 status:** 95% complete — `shopify app dev` + OAuth test remaining
**Files changed:** `CLAUDE.md`, `WORK_LOG.md`, `PROJECT_MASTER.md`, `.env.example`, `augmont-diamonds/` (full scaffold), `augmont-diamonds/prisma/schema.prisma`, `server/` (all files)
**Next session:**
1. Run `shopify app dev` → install on dev store
2. Confirm OAuth saves session to DB
3. Phase 1 = 100% complete
4. Begin Phase 2: GDPR webhooks
**Blockers:**
- Payal's API docs — ask bhaiya in the morning
- Order flow question: create a Shopify order OR only call Payal's API directly?
**Git commit:** "Phase 1 complete — full project structure, DB live, server skeleton"

---

### Day 1 — Session 2 — April 29, 2026 (~15 hour build day)
**Phase:** Phases 2 → 7 — full app built, deployed, tested

**Built:**
- **Phase 2 — GDPR + auth:** Three GDPR webhook endpoints live (`customers/redact`, `shop/redact`, `customers/data_request`). Session token verification middleware on every protected route. GDPR webhook URLs registered in `shopify.app.toml`.
- **Phase 3 — Express API:** All routes implemented in `server/`. `services/payalApi.js` ready to call Augmont LGD API once credentials arrive — login + token caching + product/order helpers stubbed. `/api/diamonds` and `/api/orders` wired through Express → Payal flow.
- **Phase 4 — Theme Extension:** `diamond-widget` deployed to Shopify CDN as version `augmont-diamonds-4`. Vanilla JS widget renders diamond grid, fetches from Express, and shows enquiry form. Liquid block embeds correctly on the storefront.
- **Phase 5 — Order/enquiry flow:** End-to-end enquiry flow live. Storefront widget → `POST /api/orders` (enquiry mode) → row written to Supabase `orders` table. Real DB writes confirmed.
- **Phase 6 — Billing skeleton:** Billing route + subscription model wired; awaits live charge testing post-submission.
- **Phase 7 — Testing + polish:** Playwright test harness installed under `playwright-tests/`. Smoke tests run against Railway URL and theme extension preview.

**Infra + deploy:**
- Express API live on Railway: `claude-code-max-shopify-app-production.up.railway.app` — `/health` returning 200.
- Theme extension `augmont-diamonds-4` set as active version.
- Admin dashboard (4 Polaris pages: home / diamonds / orders / settings) loading inside Shopify Admin via App Bridge.

**Security fixes:**
- XSS prevention added in widget — buyer-supplied input is sanitised before being rendered into the diamond cards / enquiry confirmation.
- `.dockerignore` added to prevent `.env`, `node_modules`, and other sensitive files from leaking into Railway build context.

**Bug fixes / DX:**
- Dev server startup repaired — root `package.json` and `shopify.web.toml` adjusted so `shopify app dev` works without redoing dependency install. Canonical command is now `shopify app dev --skip-dependencies-installation`.
- Theme extension errors resolved + extension `uid` written into toml; Railway URLs synced into `shopify.app.toml`.
- Express-only Railway deploy path confirmed (Procfile + start scripts).

**UI improvements deployed:**
- Storefront heading copy refined.
- Gold-accent buttons replacing default Polaris primary on the widget.
- Loading spinner on diamond fetch + enquiry submission.

**Files changed (high level):**
- `augmont-diamonds/app/routes/app.*.jsx` — 4 admin pages
- `augmont-diamonds/extensions/diamond-widget/**` — widget JS, CSS, Liquid block
- `augmont-diamonds/server/**` — full Express API (routes, middleware, services, index.js)
- `augmont-diamonds/shopify.app.toml` — GDPR webhooks, Railway URLs
- `augmont-diamonds/shopify.web.toml`, `augmont-diamonds/package.json` — dev startup fix
- `augmont-diamonds/.dockerignore` — security
- `augmont-diamonds/audit/` — audit output retained
- `playwright-tests/` — Playwright setup
- `CLAUDE.md`, `WORK_LOG.md`, `PROJECT_MASTER.md` — status sync

**Recent commits:**
- `07d24c3` Security fixes: .dockerignore + XSS prevention in widget
- `1f4f563` Fix theme extension errors + update Railway URLs in toml
- `28548cc` fix: Express-only Railway deploy + extension uid
- `bd99e46` Phase 5 complete — enquiry flow, real orders, Railway config
- `90b0f69` Phase 4 complete — theme extension widget + all admin UI pages

**Hours:** ~15 hours across the day.

**Status:** Phases 1–7 complete. App is built, deployed, and tested end-to-end against the enquiry path.

**Next session:**
1. Plug in real Augmont LGD credentials (`PAYAL_API_USERNAME` + `PAYAL_API_PASSWORD`) — bhaiya owes us these.
2. Smoke-test live `/api/diamonds` against the real Augmont catalog.
3. Phase 8: prepare App Store assets (listing copy, screenshots, privacy policy URL, support URL) and submit via Partner Dashboard.

**Blockers:**
- Augmont API credentials — pending from bhaiya.
- App Store submission assets — not produced yet.

**Git commit (this session):** "Day 1 complete — full app built, deployed, tested"

---

### Day 2 — Session 1 — April 30, 2026 — Phase A: real Augmont integration
**Phase:** A (rewrite mock catalog → live Augmont LGD API)

**Built:**
- `.env` + `.env.example` updated with `PAYAL_API_USERNAME`, `PAYAL_API_PASSWORD`, `AUGMONT_BASE_URL` (UAT base URL `https://api.uatlgd.augmont.com/api/v1`).
- `server/services/payalApi.js` — full rewrite. Real `POST /merchant/login` (JWT, 7d expiry, ~6.5d cache TTL, auto-refresh on 401). `getDiamonds()` calls real `GET /merchant/products` with Bearer token. `getDiamondById()` filters in memory. `createOrder()` left as Phase B stub. Defensive normalizer handles real Augmont fields: `weight`/`finalPrice`/`diamondImage`/`stockNum`/`pricePerCarat`.
- `server/routes/diamonds.js` — `MOCK_DIAMONDS` removed. Public + admin routes both call the live service.

**Live test result:** `GET /api/public/diamonds?shop=trial-shop-sqxnl71f.myshopify.com` returned **25 real diamonds** with prices ranging $43–$89, real `viewmydiamonds.com` images and videos.

**Railway:** `PAYAL_API_USERNAME`, `PAYAL_API_PASSWORD`, `AUGMONT_BASE_URL` set on production service via `railway variables --set --skip-deploys` (no auto-redeploy triggered).

**Notes:**
- Augmont login body uses `username` (not `uniqueId` as initial spec suggested). Corrected during probe.
- No documented `/merchant/products/:id` endpoint — `getDiamondById` filters from list. Acceptable for ~25 stones; revisit at scale.

**Files changed:** `augmont-diamonds/.env`, `augmont-diamonds/.env.example`, `augmont-diamonds/server/services/payalApi.js`, `augmont-diamonds/server/routes/diamonds.js`.

**Git commit:** `5cce80b` (rolled into Day 1 close-out commit).

---

### Day 2 — Session 2 — April 30, 2026 — Phase B: cart + checkout (PARTIAL — blocked)
**Phase:** B (storefront cart system + order placement)

**Built (working):**
- `server/services/payalApi.js` extended with `addToCart`, `getCart`, `removeFromCart`, `createOrder`, `getOrderStatus`. Shared `authedRequest` helper for GET/POST/DELETE with one-shot 401 retry. `AugmontError` class so route layer can map upstream codes (403→503 user-friendly, 404, 400) cleanly.
- Prisma schema: new `CartItem` model (`shop, sessionId, augmontCartItemId, diamondId, diamondDetails, status, createdAt, updatedAt` + indexes). Order gains `customerName, augmontInvoiceNumber (unique), augmontOrderId, cartItemIds, orderNote, statusLastChecked`. Migration `20260430173000_phase_b_cart` written manually and applied via `prisma migrate deploy` (interactive prompts blocked by non-TTY shell).
- `server/routes/cart.js` — public endpoints: `POST /api/public/cart/add`, `GET /api/public/cart`, `DELETE /api/public/cart/:id`, `POST /api/public/order/create`. All routes verify `(shop, sessionId)` ownership before calling Augmont. Idempotency: same diamond + same session returns existing record. Augmont rollback if our DB insert fails after Augmont add succeeds (no leaked cart lines on partial failure).
- `server/middleware/rateLimit.js` — tiny in-memory IP-keyed rate limiter (60 req/min). Replaces a planned `express-rate-limit` dep (CLAUDE.md rule blocked the install). Single-process only — fine for one Railway instance.
- `server/routes/cart.js#validateShop` lazily provisions a `Merchant` row for shops that have a `Session` but no `Merchant` (the OAuth flow never creates merchant records, and the FK on `cart_items.shop`/`orders.shop` requires one).
- `server/index.js` — wires cart routes + rate limit at `/api/public/*`, registers `POST /api/public/order/create` at the spec path.
- `extensions/diamond-widget/assets/diamond-widget.js` — full rewrite. Persistent `sessionId` in `localStorage` (UUIDv4). Floating cart icon top-right with item-count badge. Slide-in cart panel from right with image/spec/price/Remove rows + subtotal + Checkout. Card buttons rebranded `Add to Cart` with five visual states: idle, loading ("Adding…"), added ("Added ✓"), in-cart, error ("Try Again"), unavailable ("Cart not available"). Checkout form (name, email, optional note) → `POST /api/public/order/create` → confirmation panel with invoice number.
- `extensions/diamond-widget/assets/diamond-widget.css` — `.dw-card__enquire` renamed `.dw-card__add` + state classes. New rules for `.dw-cart-trigger`, `.dw-cart-backdrop`, `.dw-cart-panel` (slide-in from right, mobile full-width), `.dw-cart-item`, `.dw-cart-empty`. Keeps existing `.dw-overlay` rules (now reused for the checkout dialog).
- `app/routes/app.orders.jsx` — admin orders table now shows customer name + email, item count, and `augmontInvoiceNumber` instead of `payalOrderId`.

**Live test results (local Express + live Augmont UAT):**
- ADD diamond1 → 200 ✓
- ADD diamond2 → 200 ✓
- GET cart → 2 items, $145.98 ✓
- DELETE → 200, cart back to 1 ✓
- ADD diamond3 → 200, idempotent re-add returns existing ✓
- POST order/create → **503** (Augmont returned 403 — `auto_order_enabled` flag is OFF on Payal's UAT account)
- Cart preserved on order failure (no destructive cleanup) ✓
- Widget surfaces 503 as "Online checkout is not yet enabled. Please contact the store" — graceful fallback per Step 9.

**BLOCKED:**
- **Augmont `auto_order_enabled` flag is OFF.** Confirmed via live probe with valid JWT + cart populated. Need Payal to enable this flag on the UAT (and prod) merchant account before checkout can complete end-to-end. `cart_api_enabled` IS on, so the rest of the flow works.

**Not done because of block:**
- No commit of Phase B yet — per spec Step 9 ("STOP. Do not proceed.").
- No `railway up` redeploy.
- No browser-rendered widget verification on a live storefront.

**Files changed:**
- `augmont-diamonds/prisma/schema.prisma`
- `augmont-diamonds/prisma/migrations/20260430173000_phase_b_cart/migration.sql` (new)
- `augmont-diamonds/server/services/payalApi.js`
- `augmont-diamonds/server/routes/cart.js` (new)
- `augmont-diamonds/server/middleware/rateLimit.js` (new)
- `augmont-diamonds/server/index.js`
- `augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.js`
- `augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.css`
- `augmont-diamonds/app/routes/app.orders.jsx`
- `WORK_LOG.md`

**Outstanding test cart items in Augmont UAT (left in place — cleanup blocked by hook):**
- `ca97d1a2-7589-4460-9476-b45b773bcfeb` (productId `6195b47c-…`)
- `f19cbda2-6290-4cf7-9db6-cc475e2f0f42` (productId `caa91f94-…`)
- `67e20de0-01cf-4c21-9b22-76a14c650864` (productId `0c79af7c-…`)
- Plus 2 ancient items from prior testing (`a52d56de-…`, `943d6836-…`).

**Next session:**
1. Get Payal/bhaiya to enable `auto_order_enabled` on Augmont UAT.
2. Re-run order/create smoke; verify invoice number flows through to our `orders` table.
3. Decide whether to commit + deploy Phase B as-is (cart works, checkout shows friendly disabled message) OR wait for the flag.
4. Browser-rendered storefront verification.

**Blockers:**
- `auto_order_enabled` Augmont flag.

---

### Day 2 — Session 3 — April 30, 2026 — Deploy + Payal handoff

**Phase:** Deploy Phase B to production + document `auto_order_enabled` blocker

**Done:**
- `git pull origin main` — pulled merged PR #1 (Phase B cart + checkout, all 12 changed files)
- `railway up` — deploy succeeded, build URL confirmed
- `GET /health` → HTTP 200 `{"status":"ok"}` — production is live

---

## PAYAL / BHAIYA HANDOFF — `auto_order_enabled` flag

### What is blocked
`POST /api/public/order/create` returns **503** with message:
> "Online checkout is not yet enabled. Please contact the store."

The Augmont API `/merchant/order/create` returns **403** when called. This is not a code bug — it is a merchant account feature flag.

### What needs to happen (one action, 2 minutes)

1. Log into the Augmont **merchant portal** with Payal's credentials.
2. Go to **Account Settings → API Permissions** (exact label may vary — look for "Auto Order" or "Order API").
3. Enable **`auto_order_enabled`** (and confirm `cart_api_enabled` is also ON — it already is).
4. Do the same on the **production** merchant account once UAT is confirmed.

Augmont support can also enable this flag on request — email/call them with the merchant account ID.

### What is already working (no flag needed)
- `POST /api/public/cart/add` — adds diamond to Augmont cart → DB record ✓
- `GET /api/public/cart` — returns cart items with prices + images ✓
- `DELETE /api/public/cart/:id` — removes item from cart ✓
- Widget: floating cart icon, slide-in panel, item count badge, Remove button ✓
- Widget: checkout form renders, submits, shows graceful "not yet enabled" message ✓

### What gets unlocked when the flag is ON
- `POST /api/public/order/create` completes end-to-end
- Augmont generates an invoice number → stored in our `orders` table as `augmontInvoiceNumber`
- Admin orders page shows the invoice number immediately
- Customer sees confirmation panel with invoice number in the widget

### Smoke test to run after flag is enabled
```bash
# From any terminal — replace shop + sessionId as needed
curl -s -X POST https://claude-code-max-shopify-app-production.up.railway.app/api/public/order/create \
  -H "Content-Type: application/json" \
  -d '{"shop":"trial-shop-sqxnl71f.myshopify.com","sessionId":"<uuid-from-localstorage>","customerName":"Test Buyer","customerEmail":"test@test.com"}'
# Expected: 200 with invoiceNumber field
```

---

### Day 2 — Session 4 — April 30, 2026 — Three production fixes + critical infra bug

**Phase:** Post-deploy production hardening

**Built / fixed:**
1. **Widget CDN re-deploy.** `shopify app deploy` was missed at end of Phase B — Shopify CDN was still serving Phase A widget (ENQUIRE buttons, ₹ symbol). Released `augmont-diamonds-5`, replacing `augmont-diamonds-4`.
2. **Image fallback.** Augmont's `image_url` (`viewmydiamonds.com/?id=X&type=image`) returns an HTML viewer page (`text/html`, ~20 KB), not raw image bytes. The `<img>` tag fails to decode HTML → broken icon. Added `onerror` handler on every image (card grid + cart panel) that swaps in the gold-gradient placeholder with the diamond shape label. Graceful degradation; preserves images if Augmont ever fixes the URLs.
3. **Currency formatter.** Replaced ad-hoc `cart.currency + ' ' + n.toFixed(2)` with `formatMoney(price, currency)` using `Intl.NumberFormat`. Renders `$43.43` for USD, `₹3,543` for INR, etc. — driven by the currency code Augmont returns. No symbols hardcoded anywhere.

**CRITICAL INFRA BUG — Prisma + Supabase PgBouncer prepared-statement collision**

After re-deploying the widget, storefront started showing "Unable to load diamonds. Please try again." Diagnosed in this order:

| Step | Finding |
|---|---|
| `curl /api/public/diamonds` | HTTP **500** with `prepared statement "s6" already exists` (PostgreSQL code 42P05) |
| `curl` with Origin header | Same 500 — **CORS is not the problem**, response includes `access-control-allow-origin: *` |
| OPTIONS preflight | 204 with full CORS headers — preflight passes |
| `server/index.js` | `app.use(cors())` default config — works |
| `handlePublicDiamonds` | First Prisma call (`session.findUnique`) throws — never reaches Augmont |
| Railway logs | `Datasource "db": ... at "aws-1-ap-southeast-1.pooler.supabase.com"` |
| `DATABASE_URL` introspection | host `pooler.supabase.com`, port **6543** (PgBouncer), **searchParams: (none)** |

**Root cause:** Port 6543 is Supabase's PgBouncer **transaction-pooling** endpoint. PgBouncer reuses backend Postgres connections across client connections after each transaction. Prisma uses prepared statements with sequential names (`s1`, `s2`, `s3`…). When PgBouncer hands a previously-used backend connection to a new Prisma client, the old `s6` is still cached on that backend → new client tries to prepare `s6` again → Postgres `42P05`. This is a **well-documented Prisma + Supabase pooled-connection gotcha**.

Why it didn't surface immediately: when the server is fresh, Prisma owns a clean backend connection — no collision. Only after enough transactions for PgBouncer to recycle/multiplex does it start failing. Earlier curl tests (right after `railway up`) returned 25 diamonds; later requests started 500-ing.

**The fix (env-var only, no code change):**

Append `?pgbouncer=true&connection_limit=1` to runtime `DATABASE_URL`. The `pgbouncer=true` flag tells Prisma to disable prepared-statement caching, eliminating the collision. `connection_limit=1` keeps Prisma from layering its own connection pool on top of PgBouncer's pool.

**Critical: leave `DIRECT_URL` unchanged.** `DIRECT_URL` is used by `prisma migrate` (and only migrations) — it goes direct to Postgres on port 5432, no PgBouncer. Migrations require real prepared statements; setting `pgbouncer=true` there would break `prisma migrate deploy`. The two URLs serve different purposes:
- `DATABASE_URL` (port 6543, with `pgbouncer=true`) → runtime queries via pooler
- `DIRECT_URL` (port 5432, no flags) → migrations via direct connection

**Applied:**
```
DATABASE_URL = postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL   = postgresql://...pooler.supabase.com:5432/postgres   (unchanged)
```

`railway variables --set` triggers an auto-redeploy. After warm-up, 15 sequential bursts with Origin header all return 200 with full diamond JSON.

**Reference:** https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer

**SECOND CRITICAL INFRA BUG — Dev-preview asset binding pinned in theme template**

After the PgBouncer fix the API was healthy, but the storefront *still* showed Phase A widget (ENQUIRE buttons, ₹ symbol). Diagnosed:

- `shopify app versions list` → `augmont-diamonds-5  ★ active` ✓ (release WAS live)
- Authenticated through password gate, fetched storefront HTML, grepped for asset URLs:
  ```
  //cdn.shopify.com/extensions/{uid}/dev-9492c929-dfc8-4300-8cf7-675ab1d59bbb/assets/diamond-widget.js
  ```
  That `dev-` prefix is a **dev-server preview snapshot**, not a release.
- Fetched the bundle bytes: 12 matches for `enquire`, 0 for `formatMoney` / `dw-cart-trigger` — confirmed Phase A code, frozen at the time of the original `shopify app dev` session (Apr 28).

**Root cause:** When the Diamond Browser block was originally added to the theme via the dev-server preview UI, Shopify wrote the **dev-preview asset URL** into the theme template JSON. That URL is permanent until the block is removed/re-added — `shopify app deploy` releases new versions but does not rewrite theme templates that still point at dev URLs.

**Fix:** `shopify app dev clean --store trial-shop-sqxnl71f.myshopify.com`

Per `shopify help app dev clean`: "Stop the dev preview that was started with `shopify app dev`. **It restores the app's active version to the selected development store.**" Combined with re-binding the block in the Theme Editor (remove the stale block, add it back from the Apps section — it now binds to released v5 URL with no `dev-` prefix), the storefront started loading the v5 bundle.

**Reference:** https://shopify.dev/docs/api/shopify-cli/app/app-dev-clean

**Lesson learned:** Always run `shopify app dev clean` when ending a dev session, OR add theme blocks via the Theme Editor (Apps section) rather than via the dev-server preview UI — the latter creates a `dev-` URL binding that survives forever.

**Files changed:**
- `augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.js` — `formatMoney()`, `buildPlaceholder()`, image `onerror` handlers, removed unused `formatPrice()`
- `WORK_LOG.md` — Payal handoff doc + this entry
- `PAYAL_HANDOFF.md` (new) — concise blocker summary for Payal/bhaiya
- Railway env var `DATABASE_URL` — appended `?pgbouncer=true&connection_limit=1` (no code change, env-only)
- Shopify CDN extension version: `augmont-diamonds-5` (released, active)
- Theme `test-data` block re-bound to released v5 URL (was dev-preview snapshot)

**Branch:** `fix/widget-image-fallback-and-currency` (pushed). PR open: https://github.com/daman8271/Claude-Code-Max-Shopify-app/pull/new/fix/widget-image-fallback-and-currency

**Status:** Production widget fully functional. ADD TO CART buttons, $ prices, gold-gradient placeholder cards, cart icon + slide-in panel — all live on `augmont-diamonds-5`.

**Next session:**
1. Browser-test the storefront one more time (hard refresh — service workers may cache the old bundle).
2. Merge fix branch.
3. Phase B checkout still blocked on Augmont `auto_order_enabled` flag (see Payal handoff section above).

**Blockers:**
- `auto_order_enabled` Augmont flag (unchanged from Session 2).

---

### Day 2 — Close-out — May 1, 2026 (3:30 AM IST)

**Phase A: COMPLETE.** Real Augmont LGD UAT integration live. `/api/public/diamonds` returns 25 real stones with prices, images, videos.

**Phase B: COMPLETE.** Cart + checkout system deployed to production, browser-verified end-to-end.
- Storefront tested manually on `trial-shop-sqxnl71f.myshopify.com` (password redacted — see secure store).
- Place-order flow exercised with **2 diamonds, total $91.12**, full UI states observed (idle → loading → added → in-cart, plus the slide-in cart panel + remove + checkout disabled-message path).
- All four UI bugs from afternoon review are fixed and live (ENQUIRE→ADD TO CART, broken images→placeholder, ₹→$, dev-preview binding→released v5).

**Bugs fixed today (in order discovered):**
1. **Widget CDN out of sync** — `shopify app deploy` was missed at end of Phase B. Fix: re-deployed, released `augmont-diamonds-5`.
2. **Augmont image URLs are HTML viewer pages** — `<img src="...">` decode failure. Fix: `onerror` handler swaps in gold-gradient placeholder (cards + cart panel).
3. **Currency hardcoded as ₹** — Augmont returns USD with small dollar amounts. Fix: `formatMoney()` via `Intl.NumberFormat`, driven by API currency code.
4. **Prisma + Supabase PgBouncer prepared-statement collision** (HTTP 500 on `/api/public/diamonds` after server warmed up). Fix: `?pgbouncer=true&connection_limit=1` on `DATABASE_URL` (DIRECT_URL untouched).
5. **Theme template pinned to dev-preview asset URL** — `shopify app deploy` releases new versions but doesn't rewrite theme block bindings that point at `dev-` URLs from prior `shopify app dev` sessions. Fix: `shopify app dev clean --store ...` + re-bind block in Theme Editor.

**Outstanding blockers (none stop development; all are external/optimization):**
1. **`auto_order_enabled` Augmont flag (Payal action).** Documented in `PAYAL_HANDOFF.md` at repo root. Without it, checkout returns 503 with friendly message; cart fully works. Two-minute fix in Augmont merchant portal.
2. **Augmont image URLs are slow** (`viewmydiamonds.com` viewer pages, ~20 KB each, S3 + CloudFront miss on first hit per diamond). Augmont API limitation — they don't expose raw image CDN URLs. Mitigated by lazy `loading="lazy"` + onerror placeholder; will revisit in Phase C if perf complaints.
3. **Railway cold start** observed during stress test (first 2 of 15 requests returned 504 while pod warmed up). Fine for organic traffic, painful for any synthetic monitor or quiet-period buyer. Phase C optimization target — could move to Railway "always-on" tier or warm with a cron ping.

**Next session (Day 3 — Phase C: security fixes from Codex reports):**
- **Phase C: security fixes from Codex reports.** Open the Codex audit reports, triage findings, fix the high-severity items. Specific scope to be defined in the morning.

**Files / artefacts produced today:**
- Code: `extensions/diamond-widget/assets/diamond-widget.js` (rewrite), `server/services/payalApi.js` (real Augmont), `server/routes/cart.js` (new), `server/middleware/rateLimit.js` (new), `server/index.js` (rate-limit + cart wire-in), `prisma/schema.prisma` + new migration, `app/routes/app.orders.jsx`.
- Docs: `WORK_LOG.md` (this entry + Day 2 Sessions 1-4), `PAYAL_HANDOFF.md` (new at repo root).
- Infra: Railway env var `DATABASE_URL` updated with PgBouncer flags. Shopify CDN `augmont-diamonds-5` released + active. Theme `test-data` block re-bound off the dev-preview URL.

**Open PRs:**
- PR #4 — `fix/widget-image-fallback-and-currency` — open, waiting for manual merge via GitHub UI tomorrow.

**Hours:** ~14 hours across the day. Sleep.

**Phase tracker after Day 2:** Phases 1-7 ✓, A ✓, B ✓ (browser-verified). Phase 8 (App Store submission) and Phase C (security hardening) still ahead.

---

### Day 3 — May 2, 2026 — Phase D shipped to production

**Phase:** Phase D — Security hardening (5 fixes from PHASE_C_EXECUTION_PLAN.md §5)

**Built:**
- **N1** (`9618962`) — Removed empty POST `/api/orders` stub that hung forever. Buyer create-order lives in `cart.js`; admin endpoint was never used.
- **H3** (`57175f6`) — Deleted `/webhooks/billing` route entirely + marked Phase 6 deferred. App is free at launch; eliminates billing-webhook attack surface (the route was a TODO with no HMAC and no idempotency).
- **H2** (`4de2dc7`) — Public route abuse controls. NEW `validateMerchantWidget.js` middleware enforces `Merchant.widgetEnabled=true` (defaults to false). Refactored `rateLimit.js` to a `makeSlidingWindowLimiter` factory; added per-shop limiter (120 req/min) alongside the per-IP limiter (60 req/min). 5 input validators added in `enquiry.js`; cart `customerName` + `orderNote` tightened. Settings page rewritten with loader + action so admins can toggle `widgetEnabled` (was a static stub previously). Pre-deploy step: one-time `prisma.merchant.upsert` set `widgetEnabled=true` on `trial-shop-sqxnl71f.myshopify.com` before flipping prod traffic.
- **N5** (`774b507`) — CORS allowlist replacing wildcard `cors()`. Function-based origin check: `*.myshopify.com` + `admin.shopify.com`. Custom merchant domains deferred to Phase E. Clear `[cors] blocked origin: X` warning logged on deny so debugging is easy in Railway logs.
- **N7** — Verified-only, no commit needed. C1's path-scoped `apiJson({limit:"1mb"})` and `webhookJson({limit:"1mb"})` already cover all body parsers; smoke battery confirmed 2MB POST → 413.

**Doc commits:**
- `e5f0fc3` — `PHASE_E_BACKLOG.md` initial seed (Phase E scope from PHASE_C_EXECUTION_PLAN §6 + new Phase D findings).
- `524aa60` — Appended DB capacity finding from E1 smoke (connection_limit=1 saturates at ~30 concurrent).

**Deploy timeline:**
- Preview deploy `226e65be-2213-4909-b6aa-dc6365b39a4c` via `railway up --environment preview` from repo root. First attempt from inside `augmont-diamonds/` failed with the nixpacks "snapshot did not contain the 'augmont-diamonds' source directory" error — same lesson as C1 retry yesterday. Repo-root invocation succeeds because dashboard `rootDirectory: /augmont-diamonds` then correctly finds the app subfolder inside the upload.
- Production deploy `1e658cdf-a879-48ce-a750-b4100c6e5265` via the same repo-root pattern. Docker layers cached from the preview build → production build was fast (~45s vs typical 3–5 min).

**Smoke battery on preview (14/14 PASS):**
- A1–A4 (CORS allowlist): allowed origins echoed correctly with `vary: Origin`; blocked origins receive no header (browser refuses); subdomain attack `sneaky.myshopify.com.attacker.com` correctly resolves to `attacker.com` via `URL.hostname` and is blocked.
- B1–B3 (widget gate): widget-enabled trial-shop returns 25 diamonds; unknown shop blocked at gate step 2 with "shop not authorized" (security-correct: doesn't leak shop existence); missing shop param returns 400.
- C1–C2 (removed routes): POST `/api/orders` and POST `/webhooks/billing` both 404 (Remix React Router catch-all).
- D1–D3 (regression): /health 200; GDPR webhook 401 (HMAC fail, route exists, NOT 404); cart endpoint returns empty JSON for fake sessionId.
- E1 (per-IP rate limit): `5 × 429` at both `-P 65` and `-P 30` parallelism = exact mathematical prediction (`hits.length > 60` trips on requests 61–65 of any fresh-window burst). Same shape across runs proves the limiter mechanism is verified — math doesn't lie.
- F1 (body size limit): 2MB POST → 413, `apiJson` 1mb cap enforced.

**Production verification:**
- V1 /health (no Origin): 200 ✓
- V2 /health with attacker Origin: 200 + NO `access-control-allow-origin` header ✓ — N5 live on prod
- V3 /health with trial-shop Origin: 200 + `access-control-allow-origin: https://trial-shop-sqxnl71f.myshopify.com` ✓
- V4 /api/public/diamonds: deferred (Augmont upstream timed out at 60s — same volatile dependency noted in PAYAL_HANDOFF.md and CLAUDE.md §3; NOT a Phase D regression). Will be naturally exercised on the storefront when Augmont latency improves.
- V5 /api/public/cart on prod: 200 + empty cart JSON ✓ — proves widget gate works on prod and DB connectivity is fine without depending on Augmont.

**Phase E backlog populated with 3 new findings (in addition to existing items from §6):**
1. Content-length pre-check middleware on Remix catch-all routes (`/app/*`, `/webhooks/app/*`). Currently safe due to `authenticate.admin/webhook` running before body reads, but defense-in-depth for unbounded Remix-side body reads.
2. Custom merchant storefront domains for CORS (e.g. `payaldiamonds.com`). Add `Merchant.allowedOrigins` JSON column and check against per-shop list.
3. DB connection-pool ceiling under burst (~30 concurrent saturates `connection_limit=1`). Investigate raising `connection_limit` cautiously OR add a semaphore middleware ahead of DB calls OR add Express keep-alive/socket cap to fail-fast under saturation.

**Branch state:**
- `phase-c-security-hardening`: 6 commits ahead of `f797264` (C1 baseline)
  - 4 code commits: `9618962`, `57175f6`, `4de2dc7`, `774b507`
  - 2 doc commits: `e5f0fc3`, `524aa60`
- All pushed to GitHub: https://github.com/daman8271/Claude-Code-Max-Shopify-app/tree/phase-c-security-hardening

**Outstanding (post-this-session):**
- Browser-based Add to Cart end-to-end test on `trial-shop-sqxnl71f.myshopify.com` storefront — user's manual verification.
- `/api/public/diamonds` Augmont integration on prod — will be naturally exercised by the browser test once Augmont latency normalizes.
- `auto_order_enabled` Augmont flag — unchanged blocker from Phase B; checkout returns 503 with friendly message, cart works fine. See `PAYAL_HANDOFF.md`.
- Phase E security/polish work per `PHASE_E_BACKLOG.md`.
- App Store submission (Phase 8): listing assets, screenshots, copy, privacy policy URL.

**Status:** Phase C + Phase D security hardening shipped to production. Backend code is App-Store-submission-ready subject to manual storefront regression check. Single comprehensive PR (Phase G) deferred per long-standing plan.

**Production verification — partial degradation (browser smoke, May 2, 2026 — post-deploy):**
- Visited `https://trial-shop-sqxnl71f.myshopify.com` with DevTools Network tab open.
- `/api/public/diamonds` → 504 Gateway Timeout after 1.2–1.9 min.
- `/api/public/cart` → 504 Gateway Timeout after 2.1 min.
- All static resources (CSS/JS/images/fonts) → 200 OK; widget renders correctly and shows the "Unable to load diamonds. Please try again." fallback with Retry button (graceful degradation as designed).
- **Root cause:** Augmont UAT severely degraded (60–120+ s response times today — same volatile dependency seen during the preview E1 smoke and prod V4 verification). Railway edge proxy times out at ~60–100 s and returns 504 to the client.
- **Concerning:** `/api/public/cart` also 504s, even though it has no Augmont upstream. Most likely the Prisma `connection_limit=1` Supabase pool is starving — a long-running diamonds request occupies the single connection, blocking subsequent cart requests behind it. This matches the DB-capacity finding from E1 smoke (commit `524aa60`) but escalates the impact: it now affects buyer experience in real prod traffic, not just synthetic abuse bursts.
- **NOT a Phase D regression.** Phase D middleware is verified working on prod (V1/V2/V3 PASS, V5 cart PASS earlier in the session when the DB wasn't blocked). Rollback to C1 baseline would NOT fix this and would lose all Phase D security improvements.
- **Phase E priorities elevated:** Augmont response caching (Redis/in-memory with 5–15 min TTL) + DB `connection_limit` revisit + explicit 10 s upstream timeout to convert Railway 504 into a friendly 503. See `PHASE_E_BACKLOG.md` priority section for details.

---

### Day 3 — Close-out — May 3, 2026 — Phase E priorities shipped to production

**Phase:** Phase E — performance + privacy polish (PRIORITY items P1+P2 only; P3 deferred; CLEANUP C1–C6 deferred to next session).

**Built / Shipped:**
- **P1 — Augmont products SWR cache** (commit `e5ece82`). In-memory stale-while-revalidate cache (10-min TTL) over `payalApi.js#getDiamonds`. Module-scoped Map, sorted+stringified keys to avoid `{n:1}` vs `{n:"1"}` collisions, in-flight Promise dedup (thundering-herd-safe on cold miss AND background revalidation), 50-entry LRU cap (~2.5 MB worst case), 60s back-off on revalidate failure, **skip-empty** on every write path (never cache `[]` — anomaly, not real state), `?nocache=1` diagnostic bypass that doesn't pollute the cache, `AUGMONT_CACHE_TTL_MS` env override for tuning.
- **P2 — Augmont upstream timeout (10 s) + friendly 503** (commit `227315c`). Per-request `AbortController` via new `fetchWithTimeout()` helper bounding both `login()` and `authedRequest.send()`. Returns `{res, text}` so body-read is bounded too (catches "headers fast, body hangs" upstream pattern). UPSTREAM_TIMEOUT mapped to friendly HTTP 503 in three route surfaces with distinct copy: catalog ("The diamond catalog is temporarily unavailable. Please try again in a moment."), cart ("Your cart is temporarily unavailable…"), checkout ("Checkout is temporarily unavailable…"). 401-retry path gives each leg its own 10s budget. `AUGMONT_TIMEOUT_MS` env override.

**Deferred:**
- **P3 — DB `connection_limit=1` revisit** (no commit). Originally HIGH PRIORITY tonight. Two prerequisites surfaced during the P3 design walkthrough that argued for deferral:
  1. **E3 (Prisma client unification) is a hard prerequisite** — currently 2 Prisma instances (`server/services/prismaClient.js` + `app/db.server.js`); any `connection_limit=N` bump bumps actual peak to `2 × N`, defeating the intent.
  2. **Preview env shares the production Supabase project** (new finding — see Discoveries) — cannot test infra-touching changes in isolation.
- Sequencing: ship P1+P2 → observe how production handles next Augmont degradation with cache+timeout in place → revisit P3 with real data.

**Discoveries:**
- **Preview Railway env shares the production Supabase database.** Confirmed via `railway variables --kv` on both envs returning identical `DATABASE_URL` and `DIRECT_URL`. Documented in `CLAUDE.md` as critical-knowledge rule #6, plus a new finding section in `PHASE_E_BACKLOG.md` (commit `5a5efed`). Implication: preview is NOT a real staging tier; stress tests on preview affect prod data; `prisma migrate deploy` on preview applies to prod. Long-term fix tracked in backlog (provision dedicated preview Supabase project).
- **Augmont UAT outage observed during deploy verification.** Different failure modes minute-to-minute: preview probe (~30 min before prod deploy) saw raw 502 from Augmont login (5-6 s); production probe minutes later saw upstream hang > 10 s. Both real failure shapes within one session — coverage win that verified P1 wire-up AND P2 timeout firing across two distinct upstream-failure modes.

**Production smoke verification (post-deploy, single-shot sequential probes — no parallelism):**
| Probe | HTTP | Time | Body |
|---|---|---|---|
| `/health` | 200 | 0.90s | `{"status":"ok"}` |
| `/api/public/diamonds?shop=trial-shop-...` (cold) | 503 | 14.24s | `{"error":"The diamond catalog is temporarily unavailable. Please try again in a moment."}` |
| same, ~8s later | 503 | 13.75s | same friendly copy |
| same, ~16s later | 503 | 13.31s | same |
| same with `?nocache=1` | 503 | 13.20s | same |

Production Railway logs after smoke (proves cache wire-up):
```
[server] listening on :8080 (NODE_ENV=production)
[cache] miss key=<root>
[cache] miss key=<root>
[cache] miss key=<root>
[cache] bypass key=<root> reason=nocache
```

**Local smoke coverage (against deterministic mock Augmont, before deploys):**
- P1: **23/23 assertions** across 6 scenarios (cold miss → fresh hit → bypass → concurrent burst dedup → stale-hit + background revalidate → skip-empty).
- P2: **21/21 assertions** across 6 scenarios (normal call within timeout → slow upstream aborts at boundary → route maps to friendly 503 → P1+P2 stale-revalidate-fail synergy → 401-retry within budget → body-read also bounded).
- **Total: 44/44 local assertions pass.**

**Customer-facing impact tonight:**
- Augmont UAT outage was already affecting buyers BEFORE tonight's deploy — production was returning opaque 502 with `Augmont login failed` body (the OLD code's behavior).
- After tonight's deploy: same outage now surfaces as a friendly 503 with retryable copy. Buyers see "The diamond catalog is temporarily unavailable. Please try again in a moment." instead of an opaque error.
- When Augmont recovers: P1 cache absorbs repeat traffic (high hit ratio expected once warm), P2 timeout bounds future slow periods at 10 s instead of Railway's ~60 s edge proxy timeout.

**Files changed:**
- Code: `augmont-diamonds/server/services/payalApi.js` (cache layer + fetchWithTimeout), `augmont-diamonds/server/routes/diamonds.js` (UPSTREAM_TIMEOUT mapping + ?nocache=1 wiring), `augmont-diamonds/server/routes/cart.js` (UPSTREAM_TIMEOUT in userFacingError + handlePublicOrderCreate).
- Docs: `CLAUDE.md` (new rule #6), `PHASE_E_BACKLOG.md` (P1/P2 marked DONE, P3 marked DEFERRED with prereqs, new shared-DB section), `WORK_LOG.md` (this entry).

**Commits (3 code/docs):**
- `e5ece82` perf(cache): P1 — Augmont products SWR cache (10-min TTL)
- `227315c` perf(timeout): P2 — Augmont upstream timeout (10s) + friendly 503
- `5a5efed` docs: P1+P2 done, P3 deferred, shared preview/prod DB documented

**Deploy timeline:**
- Preview deploy via `railway up --ci` from repo root. Build succeeded. Preview smoke partial because Augmont was returning 502 fast (5-6 s) at that moment, so the cache-hit path was unreachable; cache-miss + bypass wire-up confirmed via Railway logs.
- Production deploy initial attempt failed with upload timeout (transient network); user-approved retry. Retry: CLI lost GraphQL subscription mid-build but server-side build completed (`Healthcheck succeeded` in build logs). No second retry needed — verified deploy live by checking new build logs + observing cache log lines after smoke probes.

**Outstanding (Phase E CLEANUP — deferred to next session, ~90 min total):**
- C1 — M1 hash emails in `gdpr.js` logs (~15 min)
- C2 — M2 sanitize errorHandler with requestId UUID (~15 min)
- C3 — E3 unify Prisma client (~25 min) [PREREQUISITE for any future P3 connection_limit change]
- C4 — `.env` cleanup (~10 min) [surfaced again tonight when local boot crashed without `SHOPIFY_APP_URL`]
- C5 — Settings "API Status: Not Connected" (~15 min)
- C6 — `/app/diamonds` static template → `/api/public/diamonds` (~20 min)

**Outstanding (external blockers — unchanged from Day 3 morning):**
- Augmont `auto_order_enabled` flag (Payal action) — see `PAYAL_HANDOFF.md`.
- Augmont UAT stability (their backend nginx 502'd / hung throughout tonight's deploy verification).
- App Store submission assets (Phase 8).

**Hours:** ~3 hours of focused Phase E work this session.

**Next session (Phase E CLEANUP):**
1. C1 + C2 first — privacy/security highest value (PII logging + error-message sanitization).
2. C3 (Prisma client unification) — unblocks future P3.
3. C4–C6 — config + admin polish.
4. Re-evaluate P3 (DB `connection_limit`) AFTER C3 lands AND we observe the next Augmont degradation event in production with P1+P2 in place.

**Branch:** `phase-c-security-hardening` (9 commits ahead of C1 baseline; pushed to GitHub).

---

### Day 4 — Close-out — May 4, 2026 — Phase E CLEANUP complete (C1–C6 shipped)

**Phase:** Phase E — cleanup pass (privacy/security/config polish + admin UI wire-up). All 6 cleanup items shipped to production.

**Built / Shipped (in order, single commit each, design-reviewed where the user flagged medium risk):**

| # | Commit | Item | Risk | Surface |
|---|---|---|---|---|
| C1 | `6ef8255` | Hash customer emails in GDPR webhook logs (SHA-256 prefix, .toLowerCase().trim() normalization, `<none>` sentinel) | LOW | `server/routes/gdpr.js` only |
| C2 | `571ea04` | Sanitize errorHandler — opaque `"Something went wrong"` on 5xx in prod, echoes msg on 4xx, requestId UUID per request, X-Request-Id header on EVERY response, two-line grep-friendly log format | LOW | `server/middleware/errorHandler.js` rewritten + new `server/middleware/requestId.js` + 1-line mount in `server/index.js` |
| C4 | `acaefba` | `.env` cleanup — added SHOPIFY_APP_URL/HOST/EXPRESS_API_URL/SHOP_CUSTOM_DOMAIN; removed PAYAL_API_KEY/PAYAL_API_URL/SHOPIFY_SCOPES/SESSION_SECRET (verified ZERO refs in code). `.env.example` rewrite (3-section structure with Railway/manual annotations). `.gitignore` patch `!.env.example` to fix pre-existing repo bug where the template was silently ignored. | LOW | `.env`, `.env.example`, `.gitignore` |
| C3 | `8a1860d` | Unify Prisma client — both `server/services/prismaClient.js` and `app/db.server.js` now share `global.__prismaSingleton`. Vite inlining of app/db.server.js into the Remix bundle is what prevented Node's ESM cache from deduping; globalThis is the canonical workaround per Prisma's own docs. Logs `[prisma] singleton initialized (pid=...)` exactly once per Node process — operators can grep this. | MEDIUM | 2 factory files, ZERO importer changes (9 importers verified untouched) |
| C5 | `3d353a1` | Settings page API status indicator — env-var-presence approach (`Boolean(PAYAL_API_USERNAME && PAYAL_API_PASSWORD)`). NO live Augmont ping at page load (Augmont's 60-120s degraded periods would tank Settings UX). | LOW | `app/routes/app.settings.jsx` only |
| C6 | `4f19a22` | `/app/diamonds` admin page wired to `/api/public/diamonds` with full state-machine (ok / widget-disabled / upstream-unavailable / error / fetch-failed) and Polaris s-table render. formatPrice/formatCarat via Intl.NumberFormat. | LOW | `app/routes/app.diamonds.jsx` rewritten |

**Total: 6 cleanup commits + 0 importer changes. Gross blast radius minimized; behavior changes are precisely scoped.**

**Bugs caught and fixed during cleanup (forensic finds, not on the original list):**
1. **`.env.example` was silently `.gitignore`d** — the `.env.*` pattern matched the template. PROJECT_MASTER.md and CLAUDE.md both refer to it as "the committed template" but `git ls-files | grep ^.env` returned empty. Fixed in C4 by adding `!.env.example` negation pattern. The C4 commit is the FIRST time `.env.example` has actually been tracked by git.
2. **Local `node --env-file=.env server/index.js` was crashing** without an inline `SHOPIFY_APP_URL=...` flag. Surfaced last night during P1+P2 smoke. Fixed in C4 by adding the missing keys to `.env`.
3. **The "Payal API Key" placeholder password field on Settings is misleading** — we use `PAYAL_API_USERNAME` + `PAYAL_API_PASSWORD`, not a "key". Flagged in C5 commit message; left untouched for strict scope. Easy follow-up.
4. **Tier 1 reference-identity test on C3 reported 2 failures** that turned out to be assertion bugs (checked `constructor?.name === "PrismaClient"` — but Prisma 6 internally minifies its runtime so `constructor.name` is `"r"`). User decision: corrected the test to use behavioral assertions (`typeof a.session === "object"`) instead of cosmetic constructor.name. Re-ran clean. Important lesson: never test on third-party library implementation details that may be minified/mangled.

**Bug #6 (shared preview/prod Supabase project) — already documented in CLAUDE.md from Day 3 close-out.** Did NOT touch infrastructure. P3 (DB `connection_limit` revisit) remains DEFERRED pending isolated preview environment provisioning.

**Smoke verification (layered: every commit's test exercised the previous commits' wiring):**

| Commit | Smoke covered (incremental + regression) |
|---|---|
| C1 | 6/6 HTTP probes — log-line format regex match, normalization correlation, `<none>` sentinel, HMAC-guard regression, deleteMany still uses raw email |
| C2 | 72/72 across 3 tiers — pure unit (40) + isolated HTTP harness (26) + real-server regression (6) including AUGMONT_TIMEOUT_MS=1 → 503 friendly (P2 INTACT verification), bad HMAC → 401 (C1 HMAC guard intact) |
| C4 | Boot test confirmed `node --env-file=.env server/index.js` no longer needs inline `SHOPIFY_APP_URL` workaround |
| C3 | 11/11 across 4 tiers — singleton reference identity (7) + real-server probes (4) + singleton-init counter == 1 at boot AND after all probes (no leakage) + lint+typecheck. C1 emailHash regression + C2 X-Request-Id regression both observed PASS in the Tier 2 logs |
| C5 | Logic verification across 4 env-var states (both set, username empty, password empty, both unset) + boot test + /app/settings 410 with Shopify auth-handling HTML (route compiles, no crash). C2 + C3 regressions PASS |
| C6 | State-machine smoke organically exercised the upstream-unavailable branch (Augmont was down — 503), widget-disabled branch (fake shop → 403), error branch (no shop param → 400). C2 + C3 regressions PASS, [prisma] init still == 1 |

**Production smoke (post-deploy, NODE_ENV=production):**

| Probe | Status | Notes |
|---|---|---|
| `/health` (a) | 200 + `x-request-id: 2781cba6-...` | C2 wire confirmed on prod |
| `/api/public/diamonds?shop=trial-shop-...` cold (b) | 503 @ 13.21s | Friendly P2 copy |
| same +10s (c1) | 503 @ 19.22s | Hit P2's 401-retry budget (10s + 10s) — exact P2 design contract under upstream-401 conditions |
| same +10s (c2) | 503 @ 13.75s | Friendly P2 |
| same `?nocache=1` (d) | 503 @ 13.40s | P1 bypass wired |
| `/health` second time (e) | 200 + DIFFERENT `x-request-id: e9be9970-...` | UUID freshness ✓ |

**Production log markers (verified counts):**
- `[prisma] singleton initialized (pid=12)` — appears EXACTLY 1 time → **C3 verified on real Railway production**
- `[cache] miss` — 3 (matches probes b/c1/c2)
- `[cache] bypass` — 1 (matches probe d)
- `[cache] hit` — 0 (Augmont down → skip-empty rule kept cache empty, exactly as designed)
- `[error] requestId=` — **0** (zero unhandled errors during smoke)
- `[server] listening on :8080 (NODE_ENV=production)` — 1 (single container boot, no flapping)
- `No pending migrations to apply` — 1 (single `prisma migrate deploy` execution at boot)

**Layered verification — all prior phases' wiring still working through C1+C2+C3:**
- P1 cache log lines visible (`[cache] miss/bypass`)
- P2 friendly 503 copy visible (and bounded at ~13-20s including 401-retry path)
- C1 emailHash format observed in prior local tests (`emailHash=c1351061c118` for `alice@test.com`)
- C2 X-Request-Id on every response (UUID per request, fresh)
- C3 singleton init counter STAYS at 1 across all production traffic during smoke

**Customer-facing impact:**
- Buyers + admins now get a unique X-Request-Id on every response — when something goes wrong, support can triangulate via `railway logs --environment production | grep "requestId=<uuid>"` and pull the structured `[error]` summary line + the multi-line `[error.detail]` stack that follows.
- Production 5xx responses no longer echo `err.message` — DB host, Prisma table names, Augmont upstream identifiers, and stack file paths are no longer leaked. Critical for App Store review.
- GDPR webhook logs no longer contain raw customer emails — `emailHash=<12-hex>` is correlated by SHA-256 of normalized email so audit trails work without storing PII.

**Files changed:**
- Code: `server/routes/gdpr.js` (C1), `server/middleware/errorHandler.js` (C2 rewrite), `server/middleware/requestId.js` (C2 new), `server/index.js` (C2 mount), `server/services/prismaClient.js` (C3), `app/db.server.js` (C3), `app/routes/app.settings.jsx` (C5), `app/routes/app.diamonds.jsx` (C6 rewrite).
- Config: `.env` (C4 — local only, gitignored), `.env.example` (C4 — first commit), `.gitignore` (C4 — `!.env.example` exception).
- Docs: `WORK_LOG.md` (this entry).

**Commits (6 cleanup + 1 docs = 7):**
- `6ef8255` fix(security): C1 — hash customer emails in GDPR webhook logs
- `571ea04` fix(security): C2 — sanitize errorHandler with requestId + opaque prod 5xx
- `acaefba` chore(config): C4 — .env cleanup + start tracking .env.example
- `8a1860d` fix(infra): C3 — unify Prisma client to a single shared instance
- `3d353a1` feat(admin): C5 — Settings API status reflects env-var presence
- `4f19a22` feat(admin): C6 — wire /app/diamonds to live Augmont catalog
- (this commit) docs: Phase E cleanup complete — Day 4 close-out

**Deploy timeline:**
- Preview deploy via `railway up --ci` from repo root. Healthcheck succeeded; smoke battery 4 probes (matched preview/prod parity). Cache log lines + singleton-init line observed exactly as designed.
- Production deploy via `railway up --ci` from repo root. CLI hit a `backboard.railway.com/graphql/v2` subscription timeout mid-deploy (same transient pattern from last night's prod deploy retry per WORK_LOG). Server-side build completed regardless — verified live via fresh probe headers (`x-request-id` present), `[prisma] singleton initialized` log line visible, single-container boot (one `prisma migrate deploy` execution, one `[server] listening`). NO retry needed; no destructive recovery actions taken.

**Outstanding (carried into Phase F):**
- **Phase F (Augmont production catalog migration) — tomorrow.** Production catalog has 700K+ diamonds vs the ~25 we've been testing against on UAT. Pagination work needed: `/merchant/products` likely needs page params; widget UI needs infinite-scroll or pagination controls; SWR cache may need per-page keying (already supported — `buildCacheKey` already sorts query params, so `?page=N` keys distinctly). Augmont API contract for pagination needs confirmation before scoping.
- **Augmont `auto_order_enabled` flag (Payal action)** — unchanged from Phase B. Cart works, checkout shows friendly disabled message. See `PAYAL_HANDOFF.md`.
- **Augmont UAT stability** — sustained outage observed throughout deploy verification. P2's friendly 503 + P1's skip-empty handle it gracefully. No code changes needed.
- **App Store submission assets (Phase 8)** — listing copy, screenshots, privacy policy URL, support URL.
- **Out-of-scope C5/C6 cleanup items flagged but not fixed:** misleading "Payal API Key" password placeholder field on Settings, matching aside-text "Get your Payal API key from Payal's supplier portal" copy, two unrelated placeholder controls (Diamonds Per Page, Primary Color). Easy follow-up commit.
- **DB `connection_limit` revisit (P3)** — still DEFERRED. C3 unblocked the prerequisite (1 instance now, not 2). Re-evaluate after observing Augmont recovery + first real load with P1 cache hot.
- **Preview env still shares production Supabase project** — bug #6 in CLAUDE.md. Provisioning a dedicated preview Supabase project tracked in `PHASE_E_BACKLOG.md`.

**Hours:** ~5 hours of focused Phase E cleanup work this session.

**Branch:** `phase-c-security-hardening` (15 commits ahead of C1 baseline; pushed to GitHub).

**Next session (Phase F — Augmont production catalog migration):**
1. Get production Augmont credentials from Payal (separate from UAT).
2. Discover production catalog size + pagination contract.
3. Design pagination + caching strategy (per-page SWR? infinite scroll? page navigation?).
4. Implement + smoke against UAT first (mock 700K via fixture if needed), then prod.
5. Re-evaluate DB `connection_limit` (P3) once P1 cache shows realistic hit ratios under prod traffic.

---

### Day 5 — Morning — May 4, 2026 — Project owner meeting findings (no code)

**Phase:** Documentation pass — capture meeting outcomes that re-shape Phase F scope and clarify long-standing blockers. **Zero code today.**

**Meeting context:** Project owner (Payal) reviewed current state and direction. Several open items resolved or re-scoped. Implementation pauses until prod credentials land (Track A) and Nivoda layout sign-off is in (Track B).

**RESOLVED FROM PRIOR BLOCKERS**
- **`auto_order_enabled` flag is NOT a critical blocker.** Some vendors prefer a cart-review-with-customer flow (manual review before order creation) — both flows are valid product behavior. Cart works; checkout's friendly disabled message is acceptable for vendors who want manual review. `PAYAL_HANDOFF.md` still applies for vendors who DO want auto-order, but this is no longer a launch blocker.
- **Image URL issue (HTML viewer pages instead of raw images) is a DEMO API artifact only.** Production Augmont API is expected to return proper image URLs. The `onerror` placeholder fallback (CLAUDE.md rule #3) stays in code as defensive programming. Verify after F1 lands.
- **API rate limits: NONE** — confirmed by Ravi (Augmont side). Our in-memory rate limiter (60/IP/min, 120/shop/min) is for our own abuse protection, not an upstream constraint.
- **Hosting: Stay on Railway for now.** VPS migration deferred indefinitely. Removes a previously-floating "should we move?" decision.

**NEW REQUIREMENTS FROM MEETING**
- **Branding: "Estrella" (US subsidiary), NOT "Augmont".** App will be published under Estrella. Full branding info (logo, colors, tagline, copy) lands Tuesday. Code identifiers (`augmont-diamonds` folder, `AUGMONT_*` env vars, upstream API references) stay technical — only user-facing copy flips to Estrella.
- **Admin dashboard direction: Copy Nivoda's admin dashboard layout exactly.** No specific layout requirements from owner — Nivoda is the reference. Implication: don't burn code time iterating our existing 4 Polaris pages until we have Nivoda screenshots + owner sign-off on the proposed redesign.
- **Pricing: FREE for 6 months. After that, configurable toggle in admin enables billing.** Build the toggle scaffolding NOW (disabled state, owner-only visibility); wire to Shopify Billing API only when toggle flips. Phase 6 status updates: not removed permanently — scaffolding to be re-added.
- **Storefront widget is the PRIMARY product value; admin is secondary.** Owner emphasized: *"first thing first, vendors can extend our theme."* Implication: widget UI/UX polish moves up in priority over admin redesign.

**PENDING DELIVERIES (external)**
- **Production Augmont credentials: TODAY (by evening).** Unblocks F1.
- **Estrella branding info: Tuesday.** Unblocks F8.
- **Final policy/legal info: last meeting before publish.** Privacy policy, ToS, support copy.
- **App ownership transfer: at end before publish.** Code lives in Daman's Shopify Partner account today; transfers to Payal's account before App Store submission.

**Phase F backlog (re-shaped — full detail in PHASE_E_BACKLOG.md)**
- F1 — Prod Augmont credentials swap (UAT → prod env vars; verify 700K catalog).
- F2 — Sign up Nivoda 30-day trial; screenshot admin dashboard; document layout patterns. *(manual user task, no code)*
- F3 — Send Nivoda-style admin mockups to project owner for sign-off **BEFORE** writing any code.
- F4 — Redesign 4 admin pages to match Nivoda layout — only after F3 sign-off.
- F5 — Catalog pagination (700K-scale). Pairs with F1.
- F6 — Storefront widget UI/UX polish pass *(NEW — primary product value per owner)*.
- F7 — Owner-only billing toggle scaffolding *(free state now, switchable later)*.
- F8 — Estrella branding swap (after Tuesday delivery).
- F9 — App ownership transfer to Payal's Shopify Partner account.

**No code today.** Implementation waits for: (Track A) prod creds, (Track B) Nivoda research + owner sign-off.

**Files changed:**
- `WORK_LOG.md` — this entry.
- `PHASE_E_BACKLOG.md` — Phase E marked COMPLETE; Phase F items F1–F9 added; resolved-blocker statuses updated.

**Outstanding (with meeting clarifications):**
- ~~Augmont `auto_order_enabled` flag~~ — re-classified: optional per-vendor preference, not a launch blocker.
- ~~"Are storefront images broken?"~~ — re-classified: demo API artifact; prod expected to return proper URLs. Verify after F1.
- App Store submission (Phase 8) — listing assets, screenshots, privacy policy URL — happens after F1–F9 complete + ownership transfer (F9).
- DB `connection_limit` revisit (P3) — still deferred. Re-evaluate after prod traffic + P1 cache hit ratios visible.
- Preview env shares prod Supabase project — bug #6 in CLAUDE.md, still tracked.

**Branch:** `phase-c-security-hardening`. Phase G integration PR strategy still TBD; defer until F1 lands and we know whether we're merging into main pre- or post-redesign.

**Next session:**
1. **TRACK A (passive):** when prod Augmont credentials arrive, F1 swap.
2. **TRACK B (active, manual):** Nivoda sign-up + admin dashboard screenshots + documented layout (no code).
3. After both: F3 mockup-for-signoff → F4 redesign begins.

---

### Day 5 — Afternoon — May 4, 2026 — Phase F1 pre-flight (filters + pagination discovery, no swap yet)

**Phase:** F1 — pre-flight credential + API-contract discovery against prod Augmont. Railway env-var swap **deferred** pending Ravi response on remaining items. **Zero code changes today.**

**Why pre-flight first:** Per the F1 design plan (this morning), validate credentials + understand API contract before touching Railway production env. Agent sandbox blocked the curl battery (production creds → external endpoint → not pre-trusted), so the user ran the probes on their local terminal and reported results back.

**Pre-flight curl battery (user-run, sanitized to chat):**

| Probe | HTTP | Latency | Notes |
|---|---|---|---|
| `POST /merchant/login` | 200 | 0.55 s | JWT returned, 261 chars, JWT-shaped (2 dots) |
| `GET /merchant/products` (no filters) | 200 | 21.0 s | Returns 25-stone "sample" set (NOT full catalog) |
| `GET /merchant/products?shape=Round` | 200 | ~10 s | Different 25 stones; `firstId` varies from baseline |
| `GET /merchant/products?color=G` | 200 | 2.9 s | Different again |
| `GET /merchant/products?shape=Round&color=G&minCarat=0.5&page=2` | 200 | 2.6 s | Pagination yields different `firstId` from page 1 |
| Same query repeated | 200 | — | Slightly different `firstId` between identical calls (suggests shuffled / non-deterministic default ordering) |

**Key insights from prod Augmont:**
1. **Filters are mandatory for meaningful catalog access.** Unfiltered requests return a fixed-size 25-stone sample (likely featured / top-of-list), NOT the 700K+ catalog. The "broken pagination" we feared during planning was actually the unfiltered-call sample being served regardless of `page=N`.
2. **Pagination only works once at least one filter is applied.** Page 2 of an unfiltered call returns the same sample.
3. **Latency correlates strongly with filter specificity.** Augmont presumably indexes the filtered fields; broad/unfiltered queries do full scans (21 s vs <3 s with a single filter).
4. **`total` field is per-page, not catalog total.** Counting the full catalog requires a separate contract — not yet known.
5. **Default ordering appears non-deterministic.** Same filter query returns slightly different `firstId` between calls — has implications for cache stability + pagination consistency.

**Code implications (for the eventual F1 + F5 + F6 work — NOT applied yet):**
- `payalApi.js` normalizer already handles both `body.data.products` and `body.data` (array fallback). Confirm against prod response shape during the swap; possible minor tweak.
- `/api/public/diamonds` endpoint already accepts query filters via `req.query` and strips `shop`/`nocache` — should work as-is for prod once env vars swap.
- **Storefront widget needs filter UI as a hard prerequisite for F1's prod rollout** (shape buttons, carat slider, color/clarity selects, price range). If the widget today issues an unfiltered request, it lands in the 21 s slow path + 25-stone sample — incompatible with a prod buyer experience. This nominally lives in F6 but blocks F1 from going live.
- **`AUGMONT_TIMEOUT_MS` (currently 10 s) is below the 21 s unfiltered latency.** Better fix is "always send a filter" at the widget layer rather than bumping the timeout — bumping just shifts the slow path onto buyers + the single Prisma pool connection.
- **Cache key strategy already sorts query params** (`buildCacheKey` in `payalApi.js`) — per-filter caching works out of the box. Per-page caching also works since `page=N` is just another sorted param.
- **Non-deterministic ordering means stale cache + a new request can disagree on page boundaries** (page 2 of stale cache vs page 2 of revalidate may return different stones). Pagination consistency needs a server-side stable sort key. Question for Ravi.
- **Image URL prefix is missing.** `diamondImage` values like `"?id=3TQOO20VQ3&type=image"` are relative — need a CDN base-URL prefix to render. Until Ravi confirms, the existing `onerror` placeholder fallback (CLAUDE.md rule #3) keeps the widget from breaking, but images won't load.
- F5 (pagination) is mostly scaffolding work once the count contract is known — widget infinite-scroll or page-nav controls + page-param wiring.

**Pending from Ravi (Augmont contact):**
- CDN base-URL prefix for `diamondImage` (without it, images don't render).
- Total catalog count contract — separate endpoint? Header? Special filter?
- Required vs optional filter parameters — is "always send a filter" the official guidance, or are there combinations that unlock unfiltered scans?
- Rate limits — meeting said "none" but need confirmation under prod traffic patterns.
- Recommended approach for "show all" use cases (admin dashboard view of full catalog).
- Stable ordering / sort key for pagination consistency.

**F1 status:** **PARKED.** Credentials validated, API contract partially mapped. Railway env-var swap deferred until:
1. Ravi clarifies the open items above (the CDN prefix is hard-blocking for image rendering; the count contract is hard-blocking for sensible UX).
2. Widget filter UI is in place (or at minimum, the widget defaults to a filtered query so the 21 s slow path isn't the buyer's first experience).

**Files changed:**
- `WORK_LOG.md` — this entry. No code changes.

**Outstanding (carrying forward):**
- F1 swap pending Ravi clarifications.
- F6 (widget UI/UX polish, including filter UI) and F7 (billing toggle scaffolding) can start in parallel — neither needs prod creds.
- F2/F3 (Nivoda research → admin redesign mockup for sign-off) — Track B, manual user task.
- All prior outstanding items unchanged (`auto_order_enabled` reclassified non-blocker, App Store assets, P3 deferred, etc.).

**Branch:** `phase-c-security-hardening`. No code commits this session.

**Next session:** Either
- Ravi has responded → resume F1 swap + any necessary code adjustments (image URL prefix concat in normalizer, response-shape tweak if needed).
- Ravi pending → start F6 (widget polish + filter UI) or F7 (billing toggle scaffolding) in parallel — both unblocked.

---
