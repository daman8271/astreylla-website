# PHASE_E_BACKLOG.md
> Items deferred from Phase D for inclusion in Phase E (security audit + hardening polish).

## Already-known Phase E scope (from PHASE_C_EXECUTION_PLAN.md §6)
- M1 — Hash emails in gdpr.js logs (sha256, first 12 chars, no PII)
- M2 — Sanitize errorHandler with requestId UUID + generic prod messages
- **E3 — Unify Prisma client** (currently 2 instances: app/db.server.js + server/services/prismaClient.js). **PREREQUISITE for P3** — without this, any future `connection_limit=N` bump means actual peak pool = `2 × N` (one per Prisma instance), not the intended value.
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

## Phase E PRIORITY items (status as of May 3, 2026)

(Originally escalated from Phase D production browser smoke, May 2, 2026.)

- **✅ DONE — P1 (commit `e5ece82`, May 3, 2026)** — **(originally HIGH PRIORITY — NEW)** **Augmont response caching.** Shipped: in-memory SWR cache (10-min TTL) over `/merchant/products` in `payalApi.js`. Skip-empty on every write path, in-flight Promise dedup (thundering-herd-safe), 50-entry LRU cap, 60s back-off on revalidate failure, `?nocache=1` diagnostic bypass, `AUGMONT_CACHE_TTL_MS` env override. 23/23 smoke assertions passed across 6 scenarios.
- **🟡 DEFERRED — P3** — **(originally HIGH PRIORITY — ESCALATED)** **DB `connection_limit=1` revisit.** Deferred pending P1+P2 production observation. Re-evaluate after the next Augmont degradation incident with cache + timeout in place — most of the previous DB pressure was likely caused by Augmont-slow requests piling up at the `validateMerchantWidget` middleware DB step, which P1 + P2 dramatically reduce. Two prerequisites surfaced during P3 design (May 3, 2026):
  1. **E3 (Prisma client unification) is a hard prerequisite.** Two Prisma client instances exist (`server/services/prismaClient.js` + `app/db.server.js`); bumping `connection_limit` without unifying first means actual peak = `2 × connection_limit`.
  2. **Preview env shares the production Supabase project** (see new finding section below). Cannot test infra-touching changes in isolation.
- **✅ DONE — P2 (commit `227315c`, May 3, 2026)** — **(originally MEDIUM PRIORITY — NEW)** **Explicit 10 s timeout on Augmont upstream calls in `payalApi.js`.** Shipped: per-request `AbortController` via `fetchWithTimeout()` helper bounds both `login()` and `authedRequest.send()`. Returns `{res, text}` so body-read is bounded too (catches "headers fast, body hangs" upstream pattern). UPSTREAM_TIMEOUT mapped to friendly HTTP 503 in three route surfaces: `routes/diamonds.js#handlePublicDiamonds`, `routes/cart.js#userFacingError`, `routes/cart.js#handlePublicOrderCreate`. 21/21 smoke assertions passed including P1+P2 stale-revalidate-fail synergy.

## New finding from P3 design walkthrough (May 3, 2026) — preview/prod share same Supabase project

While capturing rollback state ahead of the (eventually deferred) P3 connection_limit change, `railway variables --environment production --kv` and `railway variables --environment preview --kv` returned IDENTICAL `DATABASE_URL` and `DIRECT_URL` values. Both environments point at the same Supabase pooler host (`aws-1-ap-southeast-1.pooler.supabase.com`), same credentials, same `/postgres` database.

Implications:
- **Preview is not a true staging environment.** Stress-testing, destructive queries, schema migrations, or env experiments on preview affect production data.
- **`prisma migrate deploy` on preview deploys against prod data** — this has been working accidentally (migrations have been forward-compatible) but could bite us with a destructive migration.
- **Cannot safely test infra-touching changes in isolation.** Specifically blocked: P3 connection_limit testing, future schema changes that involve data migration, capacity tests.

Phase E follow-up options:
- **(cheap, done in same commit)** Document explicitly in `CLAUDE.md` as critical-knowledge rule #6 so no agent or contributor accidentally treats preview as isolated.
- **(proper, ~1-2 hr)** Provision a dedicated preview Supabase project, set its `DATABASE_URL` + `DIRECT_URL` on Railway preview env only. Then preview becomes a real staging tier and P3-class changes can be tested there safely. Worth doing before any future schema migration that involves data movement.
