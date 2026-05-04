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

---

## Phase E status — COMPLETE (May 4, 2026)

All P1 + P2 priority items shipped (commits `e5ece82`, `227315c`). All cleanup items C1–C6 shipped (commits `6ef8255`, `571ea04`, `acaefba`, `8a1860d`, `3d353a1`, `4f19a22`). See `WORK_LOG.md` Day 4 close-out.

P3 (DB `connection_limit` revisit) — DEFERRED. Prerequisites: E3 done ✓, dedicated preview Supabase project still pending. Re-evaluate after F1 lands and prod traffic exercises P1 cache hit ratio.

---

## Phase F backlog — May 4, 2026 (post-meeting)

Scope re-shaped after May 4 project owner meeting (see `WORK_LOG.md` "Day 5 — Morning" entry). Pre-existing Phase F catalog-migration scope merged with new direction items.

### Sequencing
- **TRACK A (passive)** — F1, F5 unblock when prod Augmont credentials arrive (today, by evening).
- **TRACK B (active, manual user research)** — F2 → F3 unblocks F4. Does not need credentials.
- F6, F7 can proceed in parallel with F2/F3 research.
- F8 waits for Tuesday branding delivery.
- F9 happens at the end, before App Store submission.

### Items

- **F1 — Production Augmont credentials swap.** Receive prod creds; replace `PAYAL_API_USERNAME` / `PAYAL_API_PASSWORD` / `AUGMONT_BASE_URL` (and any prod-only flags) on Railway prod env vars; verify `/api/public/diamonds` returns prod catalog (~700K stones); confirm SWR cache behavior under realistic data volume. Smoke first request times, P1 hit ratio, and image URL format (per meeting, prod is expected to return proper image URLs vs demo's HTML viewer pages). Coordinate with F5.

- **F2 — Nivoda research.** Sign up for Nivoda 30-day trial. Screenshot admin dashboard sections (home / orders / inventory / settings). Document layout patterns: information architecture, primary navigation, table density, CTA placement, status indicators. Manual user task — no code. Output: a doc/screenshots that feed F3.

- **F3 — Admin redesign mockup for sign-off.** Translate F2 findings into a proposed redesign for our 4 admin pages (home / diamonds / orders / settings). Send to project owner for sign-off **BEFORE** any code. Goal: avoid burning implementation cycles on a layout that gets rejected.

- **F4 — Admin redesign implementation.** After F3 sign-off, redesign the 4 Polaris pages to match Nivoda layout. Polaris components only (CLAUDE.md mandate). Likely affects: `app/routes/app._index.jsx`, `app.diamonds.jsx`, `app.orders.jsx`, `app.settings.jsx`, plus shared components in `app/components/`.

- **F5 — Catalog pagination (700K scale).** Was already on the roadmap. Confirm Augmont `/merchant/products` pagination contract (page/limit query params, cursor-based, etc. — likely needs an API question to Ravi). Update widget UI to support pagination/infinite scroll. SWR cache already supports per-page keying via sorted-param `buildCacheKey`. Pair with F1.

- **F6 — Storefront widget UI/UX polish (NEW — PRIMARY PRODUCT VALUE per owner).** Owner emphasized this is the core merchant value: *"first thing first, vendors can extend our theme."* Polish pass: visual design refinement, loading states, empty states, error states, mobile layout, filter/sort affordances, accessibility, and any rough edges. Scope to be defined after a design walkthrough.

- **F7 — Owner-only billing toggle scaffolding.** Build admin UI for a billing-enable toggle, default OFF. Owner-only visibility (gate by Shopify shop ID or admin-only role). When toggle flips, wire to Shopify Billing API. Until then, app is FREE for first 6 months. Phase 6 from header table re-emerges as scaffolding-now, billing-later. Re-add the billing route + Subscription model wiring (Subscription model still exists in Prisma schema).

- **F8 — Estrella branding swap.** After Tuesday's branding delivery. Update user-facing copy (admin pages, widget heading, error messages, App Store listing). Logo + colors per delivered assets. **Code identifier `augmont-diamonds`, env-var prefix `AUGMONT_`, and upstream API references stay — these are technical names, not user-facing brand.** Audit: `git grep -i augmont` to find user-facing copy candidates; spare upstream/technical references.

- **F9 — App ownership transfer.** Code currently lives under Daman's Shopify Partner account. Before App Store submission, transfer to Payal's Partner account. Coordinate via Shopify Partner Dashboard. After transfer, Daman retains code repo access (development continues), but app listing + billing flows belong to Payal.

### Resolved from prior blockers (per May 4 meeting — for backlog hygiene)

- **`auto_order_enabled` flag** is NOT a launch blocker. Cart-review-with-customer is a valid vendor flow. `PAYAL_HANDOFF.md` still applies for vendors who DO want auto-order; not in critical path.
- **Image URLs returning HTML viewer pages** — DEMO API artifact, expected to be fixed in production. `onerror` placeholder fallback stays as defensive code. Verify with F1.
- **Augmont API rate limits** — NONE (Ravi confirmed). Our in-memory rate limiter is for our own abuse protection, not an upstream constraint.
- **Railway vs VPS migration** — Stay on Railway. VPS deferred indefinitely.
