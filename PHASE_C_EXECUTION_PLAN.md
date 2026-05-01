# Phase C — Security Hardening Execution Plan

> **Goal:** Make `augmont-diamonds` Shopify App Store submission-ready by closing every Codex audit finding plus the additional gaps surfaced by an independent re-audit on 2026-05-01.

> **Branch strategy:** single branch `phase-c-security-hardening` cut from the current head of `fix/widget-image-fallback-and-currency` (which contains all Phase A + Phase B work plus the May 1 widget fixes). One PR at the end.

> **Plan author:** Claude (Opus 4.7, 1M context). Plan written 2026-05-01.

> **Supersedes:** the earlier draft at `augmont-diamonds/PHASE_C_PLAN.md` on the unmerged `phase-c-planning` branch. That branch is now obsolete and should be deleted after this PR merges.

> **For executing agents:** every fix has explicit Files / Acceptance / Risk / Rollback. Use `superpowers:executing-plans` to walk task-by-task. Mandatory `superpowers:verification-before-completion` between fixes — no claims of "done" without the listed acceptance evidence captured.

---

## 0. Phase 0 — Re-validation results (completed in this session)

The Codex audit was written against `git 07d24c3` (Apr 29). Phase A + B and the widget fix branch all merged after. I re-ran the relevant probes against the live tree at `7609579` plus the production Railway service so the rest of this plan is grounded in reality, not stale audit text.

| Probe | Command | Result |
|---|---|---|
| Production root | `curl https://claude-code-max-shopify-app-production.up.railway.app/` | `Cannot GET /` — Express has no `/` handler. Confirms **C1 is real and live**. |
| Production OAuth callback | `curl https://…/auth/callback` | HTTP 200, `application/json`, body `{"message":"auth callback placeholder"}` — the Express stub. **C1 confirmed: OAuth never completes in prod.** |
| Production health | `curl https://…/health` | 200 OK. Express is up; just incomplete. |
| Schema | `grep "shop.*@unique" prisma/schema.prisma` | line 14 — `Session.shop @unique` still present. **C2 confirmed.** |
| Toml subscriptions | `grep -nE "customers/redact\|customers/data_request\|shop/redact" shopify.app.toml` | no matches. **C3 confirmed.** Only `app/uninstalled` + `app/scopes_update` declared. |
| Scope drift | `grep -nE "process.env.SCOPES\|process.env.SHOPIFY_SCOPES" app server` | `app/shopify.server.js:14` reads `SCOPES`; `server/middleware/auth.js:8` reads `SHOPIFY_SCOPES`. **H1 confirmed.** |
| Lint | `npm run lint` | **29 errors, 0 warnings** (audit reported 34 — drift is from Phase B fixes / new files; severity unchanged). |
| Typecheck | `npm run typecheck` | passes (clean). |
| Adapter availability | `ls node_modules/@react-router/express/dist/` | `index.js` + `index.mjs` present (v7.14.2). **C1 fix path is unblocked** — official Express adapter is installed. |
| Phase B routes | manual review of `server/routes/cart.js` + `server/routes/enquiry.js` | rate-limited but otherwise reachable by anyone who knows a shop domain that has a session row. Reinforces **H2**. |

Conclusions:
- Every Codex Critical and High finding still applies as of the current head.
- The `@react-router/express` adapter is already in `node_modules`, so C1 doesn't need a new dependency — just wiring.
- Lint count is 29 (small drift from audit's 34); same kinds of issues; mostly mechanical.

---

## 1. Findings inventory

Severity scale: **C** = critical (App Store blocker), **H** = high (likely blocker or strong reviewer flag), **M** = medium (quality / privacy / DoS hardening), **L** = low (defer-acceptable).

Sources: **Codex** = the existing `audit/AUGMONT_DIAMONDS_APP_STORE_READINESS.md`. **Re-audit** = surfaced in this session by independent code review.

| ID | Sev | Source | One-liner |
|---|---|---|---|
| **C1** | C | Codex | Production `npm run start` runs only Express; embedded React Router admin UI not served at `application_url`; `/auth/callback` is a JSON stub |
| **C2** | C | Codex | `prisma/schema.prisma` line 14 `Session.shop @unique` — incompatible with Shopify's Prisma session storage adapter |
| **C3** | C | Codex | `customers/data_request`, `customers/redact`, `shop/redact` not declared in `shopify.app.toml [[webhooks.subscriptions]]` |
| **H1** | H | Codex | OAuth scope drift across `shopify.app.toml`, `app/shopify.server.js` (`SCOPES`), `server/middleware/auth.js` (`SHOPIFY_SCOPES`); `write_products` + `write_metaobjects` declared but unused |
| **H2** | H | Codex+Re-audit | Public storefront routes (`/api/public/diamonds`, `/api/public/enquiry`, `/api/public/cart/*`, `/api/public/order/create`) gated only by "shop has any session row"; permissive global CORS; no `merchant.widgetEnabled` gate; no payload size cap |
| **H3** | H | Codex | `server/routes/billing.js` is a TODO placeholder — no HMAC, no idempotency. Mounted at `/webhooks/billing` so the URL is reachable |
| **N1** | H | Re-audit | `server/routes/orders.js` `POST /` handler is an empty TODO with no `res.send()` and no `next()` — request hangs forever. Mounted under `verifySessionToken` |
| **M1** | M | Codex | `server/routes/gdpr.js:26,82` log raw customer email (PII) |
| **M2** | M | Codex+Re-audit | `server/middleware/errorHandler.js` returns `err.message` verbatim to client; TODOs for stack-trace handling and timestamp logging unaddressed |
| **M3** | M | Codex | `npm run lint` fails (29 errors). Root cause: server-side files don't match the eslint `node` env override pattern, plus six React `react/no-unescaped-entities` errors and a handful of unused-vars |
| **N2** | M | Re-audit | Shopify API version drift: `shopify.app.toml` declares `2026-07`, `app/shopify.server.js` uses `ApiVersion.October25`, `server/middleware/auth.js` uses `ApiVersion.April26` |
| **N5** | M | Re-audit | Express `cors()` is wildcard `*` — defensible for storefront fetches, but no allowlist for the storefront `*.myshopify.com` pattern + admin routes; reduces defense-in-depth |
| **N7** | M | Re-audit | `express.json()` uses default 100kb body limit; `Order.diamondDetails` is a free `Json` column — attacker-supplied payload could store oversized JSON in DB |
| **L1** | L | Codex | Theme widget block requires merchant to paste an "API Server URL" with hardcoded prod default — easy to misconfigure or stale |
| **N3** | L | Re-audit | `.env.example` is stale: lists obsolete `PAYAL_API_URL` + `PAYAL_API_KEY`; missing `SCOPES`, `SHOPIFY_APP_URL`, `HOST`, `EXPRESS_API_URL`, `SHOP_CUSTOM_DOMAIN` |
| **N4** | L | Re-audit | Dead code: `shopifyApi.sendDataReport` stub (never called); `registerWebhooks` re-export in `shopify.server.js:33` (never imported); `accessToken`/`reportPayload` parameters listed in lint warnings |
| **N6** | L | Re-audit | `cart_items` table has no TTL or cleanup — abandoned carts pile up indefinitely. Minor data hygiene only |

**Total findings:** 17 (3 C + 4 H + 5 M + 5 L). Of these, 10 came directly from Codex; 7 are net-new from this session's re-audit.

---

## 2. Out-of-scope (acknowledged blockers but NOT in Phase C)

These exist and matter, but they are **not** code changes Phase C will deliver:

1. **Augmont `auto_order_enabled` flag** — server-side flag on Payal's Augmont merchant account (UAT and prod). Documented in `PAYAL_HANDOFF.md`. Without it, checkout returns 503 with the friendly message — graceful degradation already in place. Phase C does not change this.
2. **App Store listing assets** — icon, screenshots, demo video, copy, privacy-policy URL, support URL, emergency contact. Listed in `PROJECT_MASTER.md` §5. These are Phase 8 work and a separate PR.
3. **Augmont image URL slowness** — `viewmydiamonds.com` HTML viewer pages are ~20 KB each and S3-uncached on first hit. Mitigated today by lazy `loading="lazy"` + `onerror` placeholder. Long-term fix needs Augmont to expose raw CDN URLs — not ours to solve.
4. **Railway cold-start latency** — first 1-2 requests after a quiet period return 504 while the pod warms up. Acceptable for organic traffic; would need Railway "always on" tier or a warm-ping cron — out of Phase C scope unless we hit it during demo recording.

These are tracked on the Day-2 close-out section of `WORK_LOG.md` and in `PAYAL_HANDOFF.md`. Mentioned here so the executing agent doesn't try to "fix" them inside Phase C.

---

## 3. Execution order with dependency reasoning

```
Step 0 — branch + clean baseline
   │
   ├──► Phase A: Cheap mechanical fixes (clean baseline)
   │       M3 ─► N3 ─► N4 ─► N2
   │       (lint, env example, dead code, API version)
   │
   ├──► Phase B: Schema + config (low risk, must precede Remix mount)
   │       C2 ─► H1 ─► C3
   │       (drop @unique → align scopes → declare GDPR webhooks)
   │
   ├──► Phase C: Production topology (the big one)
   │       C1
   │       (mount Remix in Express, remove placeholder OAuth)
   │
   ├──► Phase D: Hardening behind C1
   │       N1 ─► H3 ─► H2 ─► N5 ─► N7
   │       (orders stub → billing HMAC → public abuse → CORS → body limits)
   │
   ├──► Phase E: Privacy + leakage cleanup
   │       M1 ─► M2
   │       (PII out of logs → errorHandler sanitization)
   │
   ├──► Phase F: Operational polish (optional / partial)
   │       L1 ─► N6
   │       (widget URL handling → cart TTL — defer N6 if low value)
   │
   └──► Phase G: Final pass
           verification, /security-review, /audit, end-to-end install on
           fresh dev store, WORK_LOG/PROJECT_MASTER/CLAUDE.md updates,
           open one comprehensive PR.
```

**Why this order:**

- **Mechanical fixes first** so every later commit lands on a green lint baseline. If we save lint for last, we'll mix mechanical churn with substantive changes and drown the diff.
- **Schema before topology** because C2 is a 30-second migration, isolated, and needed before Remix's session storage starts creating multiple sessions per shop in production. Doing it last would require *another* deploy after C1 ships.
- **H1 before C3** because `shopify app config validate` (used to verify the toml changes for C3) checks scope syntax too. Aligning scopes first means C3 deploys cleanly in one go.
- **C1 before any public-route hardening (H2/N5/N7)** because once Remix is the front door, some public endpoints might move (e.g., GDPR routes could become Remix routes for consistency with the existing `webhooks.app.uninstalled.jsx`). We don't want to harden Express-side routes that we're about to relocate.
- **N1 (orders.js stub) early in Phase D** because it's high severity but trivial — it's a hung endpoint. If we ship anything Day 3 it should not be a regression on this.
- **M1/M2 last** before final pass because they're easy and shouldn't be batched with substantive changes that could regress.

---

## 4. Per-fix detail blocks

Every fix below has the same structure: **Files**, **What changes**, **Acceptance**, **Risk**, **Rollback**, **Skill**, **Time**.

For brevity, generic boilerplate (run lint/typecheck/tests after each fix, commit cleanly with the format from the mission brief) is implied — don't repeat it in commit-message templates.

---

### Step 0 — Branch + safety net (~10 min)

**Files:** none (git only).

**What changes:**
- Cut `phase-c-security-hardening` from current head of `fix/widget-image-fallback-and-currency`.
- Verify clean working tree first.
- Verify the obsolete `phase-c-planning` branch is local-only or has no other dependents (it just adds a doc).

**Commands:**
```bash
git status                           # must be clean
git checkout -b phase-c-security-hardening
git branch -d phase-c-planning       # local cleanup; keep remote until Day 3
```

**Acceptance:**
- `git rev-parse --abbrev-ref HEAD` → `phase-c-security-hardening`
- `git status` → clean
- `git log -1 --format=%H` matches `7609579` (current head of fix branch)

**Risk:** none. **Rollback:** delete branch.

**Skill:** none required (pure git).

---

### Phase A — Mechanical fixes (clean baseline)

#### Fix M3 — ESLint cleanup (29 → 0 errors)

**Files:**
- `augmont-diamonds/.eslintrc.cjs` — extend the Node-env override to cover `server/**/*.js`
- `augmont-diamonds/app/routes/app._index.jsx`, `app.diamonds.jsx`, `app.settings.jsx` — escape `'` characters (six instances)
- `augmont-diamonds/app/routes/app.orders.jsx:8` — remove the `eslint-disable-next-line no-undef` once the env covers `.jsx` Remix loaders correctly (the loader is server-side; either rename to `app.orders.server.jsx` style or extend the override). Cleanest fix: extend the Node override to all of `app/routes/app.*.jsx`.
- `augmont-diamonds/server/middleware/errorHandler.js:3` — prefix unused `next` with `_next` (Express middleware convention)
- `augmont-diamonds/server/routes/billing.js:8` — same `_next`
- `augmont-diamonds/server/routes/cart.js:149` — remove the `ourLineIds` Set that's built but never used
- `augmont-diamonds/server/routes/gdpr.js:20,47,76` — `_next` on three handlers
- `augmont-diamonds/server/routes/orders.js:25` — this is the empty TODO handler; will be addressed properly under N1, but for now mark `_req, _res, _next` to silence lint until N1 lands. (Order-of-operations: N1 actually deletes/replaces this handler, so the lint fix is short-lived. Acceptable.)
- `augmont-diamonds/server/services/shopifyApi.js:4` — remove unused `accessToken`/`reportPayload` parameters from `sendDataReport` (or delete the whole function — see N4)

**What changes:** the `.eslintrc.cjs` Node override currently uses pattern `**/*.server.{js,ts}`. Add `server/**/*.js` and `app/routes/app.*.jsx` (or whichever pattern catches Remix loaders that legitimately read `process.env`). After the config fix, the 14 `process is not defined` and 2 `Buffer is not defined` errors disappear automatically. The remaining ~13 errors (unescaped entities + unused vars) are file-by-file fixes.

**Acceptance:**
- `npm run lint` exits 0 (zero errors, zero warnings)
- `npm run typecheck` still passes

**Risk:** very low. Only stylistic changes.

**Rollback:** revert commit.

**Skill:** `simplify` (mechanical cleanup).

**Time:** **45 min** (slightly higher than the prior plan's 1 hr because the `.eslintrc.cjs` change resolves the bulk in one stroke, but the JSX entity escapes need careful per-file edits).

---

#### Fix N3 — Refresh `.env.example`

**Files:**
- `augmont-diamonds/.env.example`

**What changes:**
- Remove obsolete `PAYAL_API_URL` (replaced by `AUGMONT_BASE_URL`) and `PAYAL_API_KEY` (we use username/password).
- Add the keys actually referenced in code:
  - `SCOPES` (read by `app/shopify.server.js:14`)
  - `SHOPIFY_APP_URL` (read by `app/shopify.server.js:15`)
  - `HOST` (read by `server/middleware/auth.js:9`)
  - `EXPRESS_API_URL` (read by `app/routes/app.orders.jsx:8`)
  - `SHOP_CUSTOM_DOMAIN` (optional — read by `app/shopify.server.js:22`)
- Keep existing keys aligned with the `H1` fix (canonical scope variable name).

**Acceptance:**
- `grep -RhoE "process\.env\.[A-Z_]+" augmont-diamonds/{app,server} --include="*.js" --include="*.jsx" | sort -u` produces a list where every entry is documented in `.env.example` (or noted as Railway-only / system-provided like `NODE_ENV`, `PORT`).

**Risk:** zero (template file, not loaded at runtime).

**Rollback:** revert.

**Skill:** none formal — straightforward.

**Time:** **15 min**.

---

#### Fix N4 — Remove dead code

**Files:**
- `augmont-diamonds/server/services/shopifyApi.js` — delete `sendDataReport` (never called; only logs a TODO)
- `augmont-diamonds/app/shopify.server.js:33` — delete the `registerWebhooks` re-export (never imported anywhere; webhook subscription is declarative via toml)

**What changes:** small deletions. Verify with grep before deleting:
```bash
grep -RIn "sendDataReport" augmont-diamonds        # expect: only the definition
grep -RIn "registerWebhooks" augmont-diamonds      # expect: only the re-export
```

**Acceptance:**
- Above greps return 0 hits after deletion.
- Lint + typecheck still pass.
- Production health unchanged.

**Risk:** low. Verify nothing imports them first.

**Rollback:** revert.

**Skill:** `simplify`.

**Time:** **10 min**.

---

#### Fix N2 — Align Shopify API version

**Files:**
- `augmont-diamonds/shopify.app.toml:12` — `api_version = "2026-07"` (already)
- `augmont-diamonds/app/shopify.server.js:13,28` — `ApiVersion.October25` → `ApiVersion.July26`
- `augmont-diamonds/server/middleware/auth.js:11` — `ApiVersion.April26` → `ApiVersion.July26`

**What changes:** pick one stable version and use it across the three configuration sites. Per Shopify's "use latest stable" guidance and the toml's existing declaration (`2026-07`), align everything to `ApiVersion.July26`.

**Acceptance:**
- All three locations declare the same version.
- `npm run typecheck` passes (the `ApiVersion` enum has the value).
- App still starts locally with `npm run start` (or proxied dev — TBD until C1 lands).

**Risk:** low — but verify the Shopify package versions installed export `ApiVersion.July26`. If the installed `@shopify/shopify-api` doesn't have it (older), pick the latest one it does export and align all three to that.

**Rollback:** revert. Choose a different version.

**Skill:** `shopify-use-shopify-cli` (use it to confirm the latest stable version officially recommended).

**Time:** **15 min**.

---

### Phase B — Schema + config

#### Fix C2 — Drop `Session.shop @unique`

**Files:**
- `augmont-diamonds/prisma/schema.prisma:14` — remove `@unique` from `shop` field
- New migration under `augmont-diamonds/prisma/migrations/<ts>_drop_session_shop_unique/migration.sql`

**Migration body (ready to commit verbatim):**
```sql
-- DropIndex
DROP INDEX IF EXISTS "sessions_shop_key";
```

**What changes:** removing a unique constraint never fails on existing data (it relaxes, not tightens). This unblocks the Shopify Prisma session storage adapter's expected behavior of multiple sessions per shop (offline + online, multiple users, refresh-token rotation).

**Important:** the `Merchant.shopId` FK references `Session.shop`. Removing `Session.shop @unique` removes the referenced unique key, which Prisma requires for the FK target. We must either:

1. Add an `@@index([shop])` on `Session` (non-unique index for query performance + FK stability) — Prisma allows non-unique FK targets only if the column has SOME index, and even then some Postgres versions complain.
2. **Or better:** restructure `Merchant.shopId` to reference `Session.id` (the primary key) instead, and store `shop` as a normal (non-unique, indexed) string. This decouples merchant identity from session uniqueness entirely.
3. **Cleanest:** since the audit notes Shopify's adapter doesn't expect `shop @unique`, use option 2 conceptually but minimize churn — change the relation to be loose: drop the FK altogether, keep `shop` as a string column on both tables, add `@@index([shopId])` on `Merchant`.

The third option is what the cart/orders code already does in spirit (`shop` is a free string column on `cart_items` and `orders`, with the FK declared via `@relation`). Confirm by reading the post-Phase-B schema before writing the migration.

**Concrete plan for this fix:**
- Update `prisma/schema.prisma`:
  - `Session.shop` — drop `@unique`, add `@@index([shop])` for FK lookup performance
  - `Merchant.shopId` — keep as is (FK target now needs a non-unique index, which we just added)
  - Verify Prisma compiles with `npx prisma format` and `npx prisma generate`
- If Prisma rejects a non-unique FK target on this Postgres version, fall back to option 2: drop `Merchant.session` relation entirely and treat `shopId` as a denormalized string.

**Acceptance:**
- `npx prisma format` exits clean
- `npx prisma generate` exits clean
- `npx prisma migrate dev --name drop_session_shop_unique` creates the migration locally and applies it
- `psql $DIRECT_URL -c "\d sessions"` shows no unique index on `shop` (just the index)
- `psql $DIRECT_URL -c "INSERT INTO sessions (id, shop, state, accessToken) VALUES ('test1', 'a.myshopify.com', 'x', 'tok'), ('test2', 'a.myshopify.com', 'y', 'tok2');"` succeeds (two sessions for one shop)
- Cleanup: `DELETE FROM sessions WHERE id IN ('test1','test2');`

**Risk:**
- **Medium-low.** Prisma will create a migration that runs on production. The migration only drops an index, doesn't move data. Running on warm prod is safe (Postgres index drops are concurrent-safe and atomic).
- Edge case: if the FK relationship change breaks (option-2 fallback), we'd need to write a data migration to backfill. Mitigated by trying option-1 first and only falling back if Prisma refuses.

**Rollback:**
- Down migration: re-add the unique index. Pre-image the data first: `SELECT shop, COUNT(*) FROM sessions GROUP BY shop HAVING COUNT(*) > 1;` — if any duplicates exist after the change, can't safely re-add `@unique` without dedupe.
- Practical rollback: revert the migration before deploying, or add a fix-forward migration if needed.

**Skill:** `harden` (schema hardening) + `superpowers:test-driven-development` (write a Prisma test that creates two sessions for one shop, watch it fail, then drop the constraint).

**Time:** **45 min** (slightly above the prior plan's 30 min because of the FK target subtlety).

---

#### Fix H1 — Normalize OAuth scopes + minimize

**Files:**
- `augmont-diamonds/shopify.app.toml:24` — change `scopes = "write_products,write_metaobjects,write_metaobject_definitions"` to **the minimum the app actually uses**
- `augmont-diamonds/app/shopify.server.js:14` — keep `process.env.SCOPES?.split(",")`
- `augmont-diamonds/server/middleware/auth.js:8` — change `process.env.SHOPIFY_SCOPES` → `process.env.SCOPES`
- `augmont-diamonds/.env.example` — keep `SCOPES=...` (set in N3); set the same minimum value as default
- `WORK_LOG.md` / `PAYAL_HANDOFF.md` — none

**Determining the minimum scope set:**

Walk the codebase and confirm what Shopify resources are actually accessed:
- Diamonds: from Augmont (not Shopify) → no Shopify scope.
- Orders: stored in our DB (not Shopify) → no Shopify scope. *Future:* if we wire a Shopify draft order via `app/shopify.server.js`, we'd need `write_draft_orders` or `write_orders`. **Not today.**
- Metafields: not used anywhere in code (the toml entries `[product.metafields.app.demo_info]` and `[metaobjects.app.example]` are template leftovers). Remove them too.
- Webhooks: `app/uninstalled` and `app/scopes_update` are Shopify-managed, no scope cost.

**Conclusion:** the minimum today is **no scopes at all** (or the safest workable minimum, e.g. `read_products` if we eventually want to display Shopify product catalog inside admin).

For App Store submission stance, I recommend: **`scopes = ""`** (no scopes requested). If the reviewer requests scopes for any reason, add `read_products` later. Less to justify == less to reject.

Also remove the unused `[product.metafields.app.demo_info]`, `[metaobjects.app.example]`, and the related `[product.metafields.app.demo_info.access]`, `[metaobjects.app.example.access]`, `[metaobjects.app.example.fields.title]`, `[metaobjects.app.example.fields.description]` blocks from `shopify.app.toml`.

**Acceptance:**
- `shopify app config validate --json` exits 0 (run via `superpowers` CLI — see skill)
- `process.env.SCOPES` is the only scope env var referenced anywhere
- `grep -RIn "SHOPIFY_SCOPES" augmont-diamonds` returns 0 hits
- `shopify app deploy --message "phase-c: minimize scopes"` succeeds without rejection

**Risk:**
- **Medium.** Removing scopes after install requires re-OAuth on existing installs (Shopify's `app/scopes_update` flow). The handler at `app/routes/webhooks.app.scopes_update.jsx` does exist. Existing installs (just the test store today) may need to reinstall.
- The metafield/metaobject removal could 422-reject if Shopify thinks they're in use. Verify with `shopify app config validate --json` before pushing.

**Rollback:**
- Revert toml + middleware changes; re-run `shopify app deploy`.
- For the test store, may need to manually reinstall.

**Skill:** `shopify-use-shopify-cli` (canonical for `shopify app config validate`).

**Time:** **45 min** (above the prior plan's 30 min because the metafield template removal needs careful toml editing + validation).

---

#### Fix C3 — Declare GDPR webhooks in `shopify.app.toml`

**Files:**
- `augmont-diamonds/shopify.app.toml` — add three `[[webhooks.subscriptions]]` blocks
- `augmont-diamonds/server/routes/gdpr.js` — verify HMAC handling already exists (it does, via `verifyWebhookHmac`); ensure 401 on bad HMAC and ≤5s response time (already)

**Concrete toml additions:**

```toml
[[webhooks.subscriptions]]
topics = [ "customers/data_request" ]
uri = "/webhooks/customers/data_request"
compliance_topics = [ "customers/data_request" ]

[[webhooks.subscriptions]]
topics = [ "customers/redact" ]
uri = "/webhooks/customers/redact"
compliance_topics = [ "customers/redact" ]

[[webhooks.subscriptions]]
topics = [ "shop/redact" ]
uri = "/webhooks/shop/redact"
compliance_topics = [ "shop/redact" ]
```

(URIs are relative to `application_url` per Shopify's config schema.)

**Note on routing:** these URIs land on the **Express** server (which today is what's served at `application_url`). Once C1 lands, the Express + Remix multiplexing must keep `/webhooks/customers/*` and `/webhooks/shop/*` reachable on Express. The C1 fix design (below) preserves this.

**Acceptance:**
- `shopify app config validate --json` passes
- After `shopify app deploy`: trigger each webhook with the Shopify CLI:
  ```bash
  shopify webhook trigger --topic customers/data_request --address https://claude-code-max-shopify-app-production.up.railway.app/webhooks/customers/data_request
  shopify webhook trigger --topic customers/redact      --address https://claude-code-max-shopify-app-production.up.railway.app/webhooks/customers/redact
  shopify webhook trigger --topic shop/redact           --address https://claude-code-max-shopify-app-production.up.railway.app/webhooks/shop/redact
  ```
  Each must return 200 within 5s and the bad-HMAC variant must return 401.
- Partner Dashboard → App → Configuration → Compliance webhooks all show "Active" and the test buttons return green.

**Risk:**
- Low. Re-deploys the toml; doesn't change runtime behavior.
- One subtle gotcha: `compliance_topics` is the field that triggers Shopify's automated compliance check; missing it means the Partner Dashboard will still not consider the webhooks "compliance" subscriptions even if `topics` lists them. Including `compliance_topics` is the canonical pattern.

**Rollback:**
- Remove the blocks, re-run `shopify app deploy`.

**Skill:** `shopify-use-shopify-cli` for the `validate` + deploy + webhook-trigger commands.

**Time:** **45 min** (above prior plan's 30 min because of the 3 separate compliance-trigger smoke tests).

---

### Phase C — Production topology (the big one)

#### Fix C1 — Mount Remix React Router app inside Express

**Files:**
- `augmont-diamonds/server/index.js` — substantial change
- `augmont-diamonds/package.json:5,13` — `build` and `start` script updates
- `augmont-diamonds/Procfile` — confirm or update
- `augmont-diamonds/railway.json` — confirm or update
- (delete) `augmont-diamonds/server/index.js` placeholder `/auth/callback` handler — Remix's `app/routes/auth.$.jsx` owns this path

**Architecture:**

Today: `npm run start` runs `node server/index.js` only. The Remix app (`app/`) compiles to `build/server/index.js` via `react-router build` but is never served in production.

Target: a single Node process that handles BOTH the Express API (`/api/*`, `/health`, `/webhooks/*`) AND the Remix React Router app (`/`, `/app/*`, `/auth/*`, `/_root`, etc.) via the official `@react-router/express` adapter.

Concrete `server/index.js` shape:

```js
import express from "express";
import cors from "cors";
import { createRequestHandler } from "@react-router/express";
import diamondsRouter, { handlePublicDiamonds } from "./routes/diamonds.js";
import { handlePublicEnquiry } from "./routes/enquiry.js";
import ordersRouter from "./routes/orders.js";
import billingRouter from "./routes/billing.js";
import gdprRouter from "./routes/gdpr.js";
import cartRouter, { handlePublicOrderCreate } from "./routes/cart.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { publicRateLimit } from "./middleware/rateLimit.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);
app.use(cors());

// Raw-body capture is required for Shopify HMAC verification on /webhooks/*.
// Apply BEFORE the Remix handler so Express owns these paths first.
app.use(express.json({
  limit: "1mb",  // see Fix N7
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

// === Express-owned paths ===
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/public", publicRateLimit);
app.get("/api/public/diamonds", handlePublicDiamonds);
app.post("/api/public/enquiry", handlePublicEnquiry);
app.use("/api/public/cart", cartRouter);
app.post("/api/public/order/create", handlePublicOrderCreate);

app.use("/api/diamonds", diamondsRouter);
app.use("/api/orders", ordersRouter);
app.use("/webhooks/billing", billingRouter);
app.use("/webhooks", gdprRouter);                  // /webhooks/customers/*, /webhooks/shop/*

// Express error handler for the Express-owned paths above
app.use((err, req, res, next) => {
  // Only handle errors for /api, /webhooks, /health.
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/webhooks") ||
    req.path === "/health"
  ) {
    return errorHandler(err, req, res, next);
  }
  return next(err);
});

// === Remix React Router takes everything else ===
// Build output lives at build/server/index.js after `react-router build`.
const build = await import("../build/server/index.js");
app.all(
  "*",
  createRequestHandler({
    build: build.default ?? build,
    mode: process.env.NODE_ENV,
  })
);

// Final error handler for Remix-side errors (boundary takes care of HTML, but
// catch crashes outside the React tree)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

**`package.json` changes:**

```json
"scripts": {
  "build": "prisma generate && react-router build",
  "start": "prisma migrate deploy && node server/index.js",
  // ... rest unchanged
}
```

`build` already runs `react-router build` — no change needed there. The Procfile already runs `npm run start` — also no change. **Crucial:** Railway must run `npm run build` BEFORE `npm run start`. By default Nixpacks does this for any Node project with a `build` script. Verify in Railway logs after first deploy.

**`shopify.app.toml`:** the `[auth] redirect_urls` already includes `/auth/callback` — Remix's `app/routes/auth.$.jsx` claims this path. Once Express's placeholder is deleted, Remix takes over. No toml change needed for OAuth.

**Sub-tasks:**
1. Confirm `build/server/index.js` exists after `npm run build` locally (and that the build script generates Prisma client first — already does).
2. Replace `server/index.js` with the version above.
3. Delete the placeholder `app.get("/auth/callback", ...)` block.
4. Locally: `npm run build && npm run start`, then `curl localhost:4000/health` (200), `curl localhost:4000/` (200, HTML), `curl localhost:4000/api/public/diamonds?shop=trial-shop-sqxnl71f.myshopify.com` (200, diamonds JSON), `curl localhost:4000/auth/login?shop=trial-shop-sqxnl71f` (302 to Shopify OAuth).
5. Push to a Railway preview environment (not main service); smoke-test there.
6. Cut over Railway main service.
7. Hard-test: install on a *fresh* dev store via Partner Dashboard → "Test on development store". Watch full OAuth flow, embedded admin loads, navigation works.

**Acceptance:**
- Local: every curl above returns the expected status / content type.
- Railway: same probes against the live URL pass.
- Fresh-store install: OAuth completes, admin renders inside Shopify Admin iframe, all 4 admin pages (`/app`, `/app/orders`, `/app/diamonds`, `/app/settings`) load.
- Theme extension widget continues to work on the test storefront (curl `/api/public/diamonds` still returns 25 diamonds).
- `shopify app dev clean --store trial-shop-sqxnl71f.myshopify.com` runs cleanly (we want a clean dev-server state going into App Store submission).

**Risk:**
- **High.** This is the architectural change. Failure modes:
  - `build/server/index.js` import path wrong → server crashes on start
  - `addDocumentResponseHeaders` not applied to non-Remix paths → CSP/iframe issues on the admin entry
  - Existing Express routes shadowed by Remix's catch-all if order is wrong (mitigated by careful ordering above)
  - Rate-limit middleware blocking Remix navigations if path mismatch
  - Prisma client mode (the singleton in `db.server.js`) different from Express's (`prismaClient.js`) — could double-instantiate
- Mitigation: deploy to a preview-only Railway env first; run the full smoke before flipping the main service.

**Rollback:**
- Revert `server/index.js` to the current version. Re-deploy. Express placeholder returns. Worst case: minutes of downtime.

**Skill:**
- Primary: `harden` (significant security/topology change)
- `superpowers:systematic-debugging` for any first-deploy issues
- `shopify-use-shopify-cli` for the install / deploy verification commands
- Run `superpowers:verification-before-completion` mandatory after this lands.

**Time:** **3 hr** (the prior plan estimated 2-3 hr — at the upper end because of the fresh-dev-store install verification).

---

### Phase D — Hardening behind C1

#### Fix N1 — Implement or remove `POST /api/orders` stub

**Files:**
- `augmont-diamonds/server/routes/orders.js:25-31`

**Decision:** the stub was meant for the original "create order" path. Phase B replaced this with `POST /api/public/order/create` (in `cart.js`) which is the canonical buyer-flow endpoint. The admin-side `POST /api/orders` is **not used anywhere** in the current Remix admin (admin orders page is read-only). Recommendation: **delete the POST handler entirely**, keep only `GET /api/orders` for the admin orders list.

**What changes:**
```js
// orders.js — delete lines 22-31 (the POST handler with TODO comments)
// Keep only:
// - imports
// - router declaration
// - GET / handler
// - export default router;
```

**Acceptance:**
- `grep -RIn "router\.post" augmont-diamonds/server/routes/orders.js` returns no hits
- All admin orders page tests still pass (Playwright tests in `playwright-tests/`)
- Lint still passes (we removed the unused-vars source)

**Risk:** very low. The endpoint was never functional; nothing depends on it.

**Rollback:** revert.

**Skill:** `simplify`.

**Time:** **15 min**.

---

#### Fix H3 — Decide and implement billing webhook

**Files:**
- `augmont-diamonds/server/routes/billing.js`
- `augmont-diamonds/shopify.app.toml` — verify whether `/webhooks/billing` is subscribed (it is **not** today)
- `WORK_LOG.md` / `PROJECT_MASTER.md` — fix the "Phase 6: COMPLETE" claim if we choose "free for now"

**Decision required from user:** **Is this app free or paid at launch?**

Options:
- **A) Free at launch.** Remove the billing route entirely. Update WORK_LOG/PROJECT_MASTER to "Phase 6: deferred — app is free at launch". No HMAC required because the route doesn't exist.
- **B) Paid at launch.** Implement HMAC verification (reuse `verifyWebhookHmac` from `shopifyApi.js`), parse the charge event, update the `subscriptions` table idempotently keyed on `shopifyChargeId`, set `merchant.isActive = false` on cancel. Subscribe `app_subscriptions/update` and `app_purchases_one_time/update` topics in `shopify.app.toml`.

**Default recommendation:** **A (free at launch)**. The simplest path to App Store submission. We can add billing in a follow-up post-approval.

**If A:**
- Delete `server/routes/billing.js`
- Remove `import billingRouter from "./routes/billing.js"` and `app.use("/webhooks/billing", billingRouter)` from `server/index.js`
- Delete `app/components/BillingBanner.jsx` if not referenced by any admin page (check first)
- Update `WORK_LOG.md` Phase 6 entry: "Deferred — app is free at launch. Billing flows to be added post-App-Store approval."
- Update `PROJECT_MASTER.md` Phase 6 row: status `DEFERRED — free at launch`

**If B:** requires a separate ~2hr fix block; out of scope unless the user picks paid.

**Acceptance (Option A):**
- `grep -RIn "billing" augmont-diamonds/server` returns no hits
- `grep -RIn "Phase 6.*COMPLETE" .` returns no hits
- App still starts and admin pages render

**Risk:** Option A is low. Option B is medium (needs HMAC tests).

**Rollback:** revert.

**Skill:** `harden` if option B; `simplify` if option A.

**Time:** **30 min** option A, **2 hr** option B.

---

#### Fix H2 — Public route abuse controls

**Files:**
- `augmont-diamonds/server/middleware/validateMerchantWidget.js` — new file
- `augmont-diamonds/server/index.js` — wire new middleware into `/api/public/*`
- `augmont-diamonds/server/routes/cart.js` — replace ad-hoc `validateShop` with the middleware
- `augmont-diamonds/server/routes/diamonds.js` — same
- `augmont-diamonds/server/routes/enquiry.js` — same + tighten input validation

**What changes:**

1. **Merchant widget gate.** Today public routes only check that a `Session` exists for the shop. Add an additional check: the `Merchant.widgetEnabled` flag must be `true`. Default is `false` — merchants must opt-in via the admin Settings page (already wired). This narrows the abuse surface from "any installed shop" to "any installed shop that has explicitly enabled the widget".

2. **Input schema validation.** Add explicit validators (or schema-light hand-rolled ones — no zod dep needed if we don't already have it):
   - `enquiry.js`: `name` 1-200 chars, `email` validated (use the same regex as cart.js), `message` ≤ 2000 chars, `diamondId` ≤ 200 chars, `diamondDetails` JSON ≤ 10 KB.
   - `cart.js` already has decent validation; tighten `customerName` and `orderNote` length caps.

3. **Per-shop rate limit (in addition to per-IP).** Today's rate limit is IP-keyed. Add a second bucket keyed on `shop` (60 req/min/shop) so a single shop can't be DoSed by attackers rotating IPs. Use the same in-memory `rateLimit.js`, just second bucket.

4. **CORS tightening (overlaps with N5)** — see N5.

**Acceptance:**
- `curl -X POST .../api/public/cart/add -d '{"shop":"<shop-with-widgetEnabled-false>","sessionId":"...","productId":"..."}'` returns 403 with body `{"error":"widget disabled for this shop"}`
- After enabling the widget on the test shop's Settings page, same curl succeeds
- Submitting a 100KB `message` to `/api/public/enquiry` returns 413 (body too large)
- 61 rapid requests from the same shop (any IP mix) returns 429

**Risk:** medium. The widgetEnabled gate could lock out the test storefront if not flipped. Verify the Settings page's widget toggle works first; flip it on for the test shop before deploying.

**Rollback:** revert.

**Skill:** `harden` + `security-review` (run `/security-review` on the diff after).

**Time:** **2 hr**.

---

#### Fix N5 — CORS allowlist

**Files:**
- `augmont-diamonds/server/index.js:16` (the `app.use(cors())` line)

**What changes:**

Today: `app.use(cors())` — allows any origin with default settings (no credentials).

Target: configurable allowlist with sensible production defaults.

```js
import cors from "cors";

const corsOptions = {
  origin: (origin, cb) => {
    // No origin = same-origin or non-browser request — allow.
    if (!origin) return cb(null, true);
    // Storefront widgets run on merchant Shopify storefronts.
    if (/\.myshopify\.com$/.test(new URL(origin).hostname)) return cb(null, true);
    // Allow custom domains the merchant has flagged in Merchant.allowedOrigins?
    // (Future: read from DB — for now allow only myshopify.com)
    // Admin embedded comes from admin.shopify.com.
    if (/^admin\.shopify\.com$/.test(new URL(origin).hostname)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: false,
};
app.use(cors(corsOptions));
```

**Note:** custom merchant storefront domains (e.g. `mystore.com` instead of `mystore.myshopify.com`) are NOT in this allowlist. For Phase C, this is acceptable — most merchants test on `*.myshopify.com` first, and the App Store reviewer uses a dev store on that domain. Document the limitation in PROJECT_MASTER for a follow-up.

**Acceptance:**
- `curl -H "Origin: https://attacker.example.com" /api/public/diamonds?shop=...` returns CORS error or no `access-control-allow-origin: *` header
- `curl -H "Origin: https://trial-shop-sqxnl71f.myshopify.com" /api/public/diamonds?shop=...` returns 200 with `access-control-allow-origin: https://trial-shop-sqxnl71f.myshopify.com`

**Risk:** medium. If the regex is wrong, legitimate widget calls fail. Test on the live test storefront before merging.

**Rollback:** revert (back to wildcard).

**Skill:** `harden`.

**Time:** **30 min**.

---

#### Fix N7 — Body size + payload caps

**Files:**
- `augmont-diamonds/server/index.js` — set explicit `express.json({ limit: "1mb" })`
- `augmont-diamonds/server/routes/enquiry.js` and `cart.js` — already validate field lengths (after H2) — confirm `JSON.stringify(diamondDetails).length` is bounded
- `augmont-diamonds/server/middleware/payloadCap.js` — new file (optional, only if H2's per-field caps don't cover everything)

**What changes:** make the Express body parser limit explicit at 1 MB (default is 100 KB but that's silently set; making it explicit is reviewer-friendly). Ensure `diamondDetails` JSON written into Postgres is capped — already covered by H2's input validation.

**Acceptance:**
- `curl -X POST -d "$(head -c 2000000 /dev/urandom | base64)" .../api/public/enquiry -H "Content-Type: application/json"` returns 413
- Lint + typecheck pass

**Risk:** low.

**Rollback:** revert.

**Skill:** `harden`.

**Time:** **15 min** (overlaps mostly with H2).

---

### Phase E — Privacy + leakage cleanup

#### Fix M1 — Stop logging customer emails

**Files:**
- `augmont-diamonds/server/routes/gdpr.js:26,82-83` — replace `email=${email}` with `emailHash=${sha256(email).slice(0,8)}`
- (optional) extract the helper into `server/services/log.js` if reused

**What changes:**
```js
import { createHash } from "crypto";
function emailHash(email) {
  if (!email) return "<none>";
  return createHash("sha256").update(email).digest("hex").slice(0, 12);
}
console.log(`[gdpr] customers/redact shop=${shop_domain} emailHash=${emailHash(email)}`);
```

**Acceptance:**
- `grep -nE "email=" server/routes/gdpr.js` returns 0 matches in log lines
- Reviewing Railway production logs from a triggered redact webhook shows hashes only

**Risk:** zero (logging only).

**Rollback:** revert.

**Skill:** `harden`.

**Time:** **15 min**.

---

#### Fix M2 — Sanitize errorHandler

**Files:**
- `augmont-diamonds/server/middleware/errorHandler.js`

**What changes:**

```js
import { randomUUID } from "crypto";

export function errorHandler(err, req, res, _next) {
  const requestId = randomUUID();
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Always log full error server-side with the request id for correlation.
  console.error(`[error] ${requestId} ${req.method} ${req.path} status=${status}`, {
    message: err.message,
    stack: err.stack,
    code: err.code,
  });

  if (isProd) {
    // Generic message to client; never leak err.message.
    return res.status(status).json({
      error: status >= 500 ? "Internal server error" : "Bad request",
      requestId,
    });
  }

  // Dev: include err.message + requestId for quick triage.
  res.status(status).json({
    error: err.message || "Internal server error",
    requestId,
    stack: err.stack,
  });
}
```

**Acceptance:**
- In production (`NODE_ENV=production`), `curl /api/public/diamonds?shop=invalid-shop` → response body has `{"error":"Bad request","requestId":"<uuid>"}` — no internal message.
- In development, same call returns the descriptive message + request id + stack.
- Server logs always contain the full error keyed by request id.

**Risk:** low.

**Rollback:** revert.

**Skill:** `harden`.

**Time:** **30 min**.

---

### Phase F — Operational polish (defer-acceptable)

#### Fix L1 — Theme widget API URL footgun

**Files:**
- `augmont-diamonds/extensions/diamond-widget/blocks/diamond-browser.liquid:30` — keep the prod default but add validation
- `augmont-diamonds/extensions/diamond-widget/assets/diamond-widget.js:17-23` — already shows config-error for missing URL; tighten to detect dev/staging URL patterns and warn merchants

**What changes:** keep the API URL setting but:
- Add a comment in the Liquid schema explaining "Do not change unless your developer instructs you" (already loosely there)
- In JS, if URL points to localhost / `dev-` URL, log a console warning so the merchant's developer notices in dev tools.

This is **defer-acceptable** — not a blocker. Recommend skipping in this Phase C unless extra time exists. Listed for completeness.

**Acceptance:**
- New install picks up the prod URL from the schema default
- A wrongly-pasted URL produces a visible config error in the storefront

**Risk:** very low.

**Rollback:** revert.

**Skill:** `shopify-liquid` (for any liquid changes); `harden` (for the JS warning).

**Time:** **30 min** (defer-acceptable).

---

#### Fix N6 — Cart item TTL / cleanup (defer)

**Files:** would touch `prisma/schema.prisma`, a new migration, and possibly a scheduled job.

**Recommendation:** **defer.** Stale carts are a hygiene issue, not a security issue. Open a follow-up ticket. Don't include in this Phase C PR.

**Time:** **0 min** (deferred).

---

### Phase G — Final pass

After every fix above is committed:

1. **Run full automated checks:**
   ```bash
   cd augmont-diamonds
   npm run lint            # 0 errors
   npm run typecheck       # passes
   npm audit --omit=dev    # 0 known vulns
   ```
2. **Run `/security-review` slash command** on the diff vs main.
3. **Run `/audit` slash command** on the changed surfaces.
4. **Run `shopify-app-store-review` skill** to walk the App Store checklist.
5. **End-to-end install test on a fresh dev store:**
   - Partner Dashboard → "Test on development store" → "Augmont Diamonds"
   - Pick a brand-new dev store (not the existing `trial-shop-sqxnl71f`)
   - Click "Install"
   - Verify OAuth completes, lands on `/app`
   - Click each admin page, verify renders
   - Add the Diamond Browser block via Theme Editor → Apps section
   - Visit storefront, verify widget loads, add to cart, attempt checkout
   - Trigger each GDPR webhook via Partner Dashboard "Send test" buttons — all green
6. **Update tracked docs:**
   - `WORK_LOG.md` — add Day 3 / Phase C entry (every fix listed)
   - `PROJECT_MASTER.md` — mark Phase C complete; update remaining-before-submission list
   - `CLAUDE.md` — add any new critical-knowledge bullets surfaced (e.g. "Remix is mounted under Express via `@react-router/express` — don't run `react-router-serve` separately")
7. **Open ONE PR** from `phase-c-security-hardening` → `main` with:
   - Summary of every Codex finding and the fix shipped
   - Before/after for C1, C2, C3, H1 (the App Store-blockers)
   - Testing methodology (commands, evidence)
   - Remaining acceptable risks (Augmont flag, listing assets, custom-domain CORS limitation)
   - App Store readiness assessment ("ready to submit pending listing assets and Augmont flag")
   - Reference to Shopify App Store guideline compliance

**Time:** **2 hr** (testing + writing docs + PR).

---

## 5. Total time budget

| Phase | Fixes | Time |
|---|---|---|
| Step 0 | branch + safety net | 10 min |
| A — mechanical | M3, N3, N4, N2 | 1 hr 25 min |
| B — schema + config | C2, H1, C3 | 2 hr 15 min |
| C — topology | C1 | 3 hr |
| D — hardening | N1, H3 (option A), H2, N5, N7 | 3 hr 30 min |
| E — privacy | M1, M2 | 45 min |
| F — polish (mostly deferred) | L1, N6 | 30 min |
| G — final pass | verify + PR | 2 hr |
| **Total** | | **~13 hr** |

Calendar: realistically 2 focused work days. The prior plan estimated ~8 hours total but that was scoped to Codex-only findings. The re-audit added 7 new findings worth ~3 extra hours, plus the higher confidence on C1 (3 hr instead of "2-3"), and the +2 hr for the final-pass install/verify/PR.

If you want to compress: skip Phase F (L1 + N6) and accept option A for H3. That saves ~30-60 min and is what I'd recommend for fastest App Store submission path.

---

## 6. Open questions for the user

1. **Free or paid at launch?** Decides Fix H3 (option A: 30 min, option B: 2 hr).
2. **Branch off `fix/widget-image-fallback-and-currency` or wait for PR #4 to merge into `main` first?** My recommendation: branch off the current state (today's `fix/...` branch). PR #4 can still merge separately into main; we rebase if needed. **Rationale:** doesn't block on the user's manual GitHub merge.
3. **Phase C single-PR vs phased PRs?** The mission spec says single PR. Confirming. (My recommendation: single PR is right — simpler review, single deploy, atomic rollback.)
4. **Custom merchant storefront domains in CORS allowlist (Fix N5)?** For now I'm allowlisting only `*.myshopify.com` + `admin.shopify.com`. If any of your merchants will use a custom domain (e.g. `payaldiamonds.com`) before App Store approval, we need a different design (read from DB).
5. **Test installation against `trial-shop-sqxnl71f` (existing) vs a fresh dev store?** Recommend fresh dev store for the final acceptance — proves OAuth from scratch. The existing store will be used for regression testing widget behavior.
6. **Augmont `auto_order_enabled`** — still off per `PAYAL_HANDOFF.md`. Phase C end-to-end demo can show: cart works + checkout shows the friendly disabled message. Confirming that's acceptable for the App Store demo screencast (it should be — graceful degradation is shippable).

---

## 7. Risks summary

The single biggest risk in this plan is **C1 (the Remix-in-Express mount)**. Everything else is small, isolated, or reversible. C1 has multiple unknowns (build path, route ordering, CSP application, fresh-install OAuth) and a real chance of breaking the live admin between deploys.

Mitigation strategy:
- Test C1 locally end-to-end before pushing.
- Push to a Railway *preview* environment first (separate service), not the main production service.
- Keep the rollback commit handy: a one-click revert returns the placeholder state.
- Don't merge the PR until the fresh-store install test passes.

---

## 8. Acceptance — when is Phase C "done"

- [ ] All findings in §1 are either fixed or explicitly deferred with documented justification
- [ ] `npm run lint` exits 0
- [ ] `npm run typecheck` exits 0
- [ ] `npm audit --omit=dev` shows 0 high/critical
- [ ] `shopify app config validate --json` exits 0
- [ ] Fresh dev-store install completes end-to-end (OAuth → admin → storefront widget → cart works)
- [ ] All 3 GDPR webhooks return 200 on valid HMAC and 401 on invalid
- [ ] `/security-review` slash command produces zero critical or high findings
- [ ] `shopify-app-store-review` skill checklist passes
- [ ] Single PR open with the documentation listed in §G
- [ ] WORK_LOG, PROJECT_MASTER, CLAUDE.md updated

When all 11 boxes are ticked, the app is App Store submission-ready (pending the out-of-scope items in §2 — Augmont flag and listing assets).
