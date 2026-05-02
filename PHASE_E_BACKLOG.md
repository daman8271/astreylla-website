# PHASE_E_BACKLOG.md
> Items deferred from Phase D for inclusion in Phase E (security audit + hardening polish).

## Already-known Phase E scope (from PHASE_C_EXECUTION_PLAN.md §6)
- M1 — Hash emails in gdpr.js logs (sha256, first 12 chars, no PII)
- M2 — Sanitize errorHandler with requestId UUID + generic prod messages  
- E3 — Unify Prisma client (currently 2 instances: app/db.server.js + server/services/prismaClient.js)
- .env cleanup: add SHOPIFY_APP_URL/HOST/EXPRESS_API_URL/SHOP_CUSTOM_DOMAIN; remove PAYAL_API_KEY/PAYAL_API_URL/SHOPIFY_SCOPES/SESSION_SECRET
- Settings "API Status: Not Connected" — admin form doesn't read AUGMONT_API_KEY env
- Admin /app/diamonds shows static template data — should call /api/public/diamonds

## Newly added during Phase D
- Content-length pre-check middleware on Remix catch-all routes (/app/*, /webhooks/app/*). Currently safe due to authenticate.admin/webhook running before body reads, but belt-and-suspenders for unbounded Remix-side body reads. Low priority, no known exploit path.
- Custom merchant storefront domains for CORS (e.g. payaldiamonds.com) — add Merchant.allowedOrigins JSON column, check against per-shop list. Until then, custom-domain storefronts CORS-blocked + warning logged.
- Sliding-window dedupe for [cors] blocked origin warnings if log volume becomes problematic from attacker spam.

## New finding from Phase D smoke (May 2, 2026) — DB capacity ceiling
- Even 30 concurrent requests/IP to /api/public/cart cause ~75% to error
  with 500 (Prisma connection pool saturation under PgBouncer
  connection_limit=1). The 60-req/min rate limiter fires correctly
  (proven by exactly 5 × 429 emitted at both -P 65 and -P 30, matching
  the implementation math: requests 61-65 of any fresh-window burst).
- Attacker is still blocked end-to-end (429 OR 500), but the 500s
  consume server CPU + DB attempts before being rejected, weakening
  defense. Phase E task: investigate raising connection_limit cautiously
  (Supabase pooler has its own pool size limit), OR add a
  semaphore/queue middleware that caps concurrent DB-touching requests
  per pod, OR add an Express keep-alive/socket cap to fail-fast when
  pool is saturated. Reference: this Phase D smoke run, deploy
  226e65be on preview env.

## Phase E PRIORITY items (escalated from Phase D production browser smoke, May 2, 2026)

- **(HIGH PRIORITY — NEW)** **Augmont response caching.** Add Redis or in-memory cache with 5–15 min TTL on `/merchant/products` responses to mitigate UAT slowness affecting the customer-facing storefront widget. Without this, any Augmont degradation directly degrades buyer experience (504 Gateway Timeout on `/api/public/diamonds`). Caching also helps with per-shop rate-limited bursty traffic patterns by serving most requests from cache.
- **(HIGH PRIORITY — ESCALATED)** **DB `connection_limit=1` is too restrictive under real customer traffic.** Even non-Augmont endpoints (`/api/public/cart`) now time out behind the single starved Prisma connection when a long-running diamonds request is occupying it. Browser smoke on May 2, 2026 confirmed this affects buyer experience, not just synthetic abuse bursts. Investigate raising `connection_limit` cautiously (Supabase pooler has its own pool size limit per project tier). Likely a small bump (2–4) rather than full pool, since PgBouncer transaction-pooling caps backend reuse.
- **(MEDIUM PRIORITY — NEW)** **Explicit 10 s timeout on Augmont upstream calls in `payalApi.js`.** Currently there is no upstream timeout; long-running calls block until the Railway edge proxy times out at ~60–100 s, returning a generic 504 to the client. With an explicit 10 s timeout, our handler can catch the upstream timeout and return a friendly 503 with "Catalog temporarily unavailable, please retry shortly" — same pattern as the existing Augmont-403→503 mapping for `auto_order_enabled`.
