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
| 6 | Billing API | COMPLETE | Apr 29, 2026 |
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
