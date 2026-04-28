# App Store Readiness + Security Audit (Read-Only): `augmont-diamonds`

Audit date: 2026-04-29 (Asia/Kolkata)  
Repo snapshot: git `07d24c3`  
Scope: read-only review of `augmont-diamonds/` (app + Express API + theme extension + Prisma + deploy config). No code changes were made.

This report uses [SHOPIFY_APP_STORE_GUIDELINES.md](./SHOPIFY_APP_STORE_GUIDELINES.md) as the requirements baseline (official Shopify docs).

## Executive Summary

In the current state, this app is **very likely to be rejected** in Shopify App Store review because the production start path appears to run **only the Express API** (and even exposes a placeholder `/auth/callback`), while the embedded admin UI (React Router app) doesn’t appear to be served in production at the configured `application_url`. Additionally, mandatory compliance webhook subscriptions are not configured in `shopify.app.toml`, and the Prisma `Session` schema is likely incompatible with Shopify’s Prisma session storage adapter due to `shop @unique`.

### Rejection Chance (Heuristic)

Estimated probability of rejection *if submitted today with this code and the current `application_url` deployment*: **85% to 95%**.

Why this estimate is so high:

- Shopify reviewers must be able to install and open an embedded UI without fatal errors; current production startup configuration strongly suggests OAuth/UI will fail.
- Missing mandatory compliance webhook subscriptions is a common hard blocker.
- Auth/session persistence schema likely breaks when multiple sessions exist (common in embedded apps).
- Several core routes/services are still TODO/placeholder, suggesting “not production-ready”.

## What Was Checked (Read-Only)

### Non-mutating commands run

- `npm run typecheck`: **pass** (no output)
- `npm run lint`: **fail** (34 errors)
- `npm audit --omit=dev --json`: **0** known production vulnerabilities reported by npm

### Manual code review areas

- Shopify admin embedded app shell/auth: `app/*`
- Express API: `server/*`
- Theme extension widget: `extensions/diamond-widget/*`
- Data layer: `prisma/schema.prisma`
- Deploy/runtime config: `package.json`, `Procfile`, `railway.json`, `Dockerfile`, `.dockerignore`, `shopify.app.toml`

## Shopify Requirements Mapping (High Signal)

- ✅ Session token verification exists for protected Express routes: [server/middleware/auth.js](../server/middleware/auth.js) (lines 14-35).
- ✅ CSP/iframe protection is *likely* handled by Shopify’s React Router package headers hook: [app/entry.server.jsx](../app/entry.server.jsx) (line 16) calling `addDocumentResponseHeaders`.
- ❌ Mandatory compliance webhook **subscriptions** are missing from `shopify.app.toml`: only `app/uninstalled` and `app/scopes_update` are configured. See [shopify.app.toml](../shopify.app.toml) (lines 11-21).
- ❌ Production install/OAuth/UI flow is **likely broken** due to runtime topology (details below).
- ❌ OAuth scopes look high-risk and inconsistent (details below): see [shopify.app.toml](../shopify.app.toml) (line 24) and [app/shopify.server.js](../app/shopify.server.js) (lines 14-16).
- ⚠️ Billing compliance: billing webhooks and billing enforcement are placeholders; whether you need billing depends on whether the app is paid. See [server/routes/billing.js](../server/routes/billing.js) (lines 5-14).

## Findings (Severity First)

### Critical

#### C1) Production `start` only runs Express API; embedded admin UI likely not served

**Evidence**

- `npm run start` runs `node server/index.js`: [package.json](../package.json) (line 12).
- Express server does not serve the React Router app; it only exposes JSON routes and a placeholder OAuth callback: [server/index.js](../server/index.js) (lines 19-35).
- Platform start configs point to `npm run start`:
  - [Procfile](../Procfile) (`web: npm run start`)
  - [railway.json](../railway.json) (`startCommand: "npm run start"`)

**Abuse/Failure Path**

- Shopify redirects OAuth to `/auth/callback` (configured in `shopify.app.toml`), but Express responds with a placeholder JSON payload, not an OAuth completion flow. See [shopify.app.toml](../shopify.app.toml) (line 27) and [server/index.js](../server/index.js) (lines 24-28).

**Impact**

- Install/login likely fails.
- Review will be blocked immediately (Shopify commonly rejects apps that error/404/500 or don’t complete install and open an embedded UI).

**Remediation direction**

- Ensure production starts the React Router embedded app server on the externally exposed port (and routes `/auth/*` correctly), and runs Express either:
  - behind the same origin (mounted under `/api/*`), or
  - on a separate internal service with correct routing, TLS, and allowlist controls.

#### C2) Prisma `Session.shop` is marked `@unique`, likely incompatible with Shopify’s Prisma session storage adapter

**Evidence**

- `Session.shop` is `@unique`: [prisma/schema.prisma](../prisma/schema.prisma) (line 14).
- Shopify’s own Prisma session storage adapter docs show `shop String` (not unique) as the expected shape: `@shopify/shopify-app-session-storage-prisma` README in `node_modules` (lines 8-26).

**Abuse/Failure Path**

- Shopify apps commonly store multiple sessions per shop (for example: offline + online, multiple users). If the storage adapter attempts to create a second session row with the same `shop`, the DB unique constraint can fail and break auth or session persistence.

**Impact**

- Authentication/session persistence can fail in real merchant environments, causing install/open loops and review rejection.

**Remediation direction**

- Align the Prisma `Session` model to Shopify’s adapter expectations (avoid `shop @unique`) and redesign merchant linkage so it doesn’t assume “one session row per shop”.

#### C3) Mandatory compliance (GDPR-style) webhook subscriptions missing from Shopify CLI config

**Evidence**

- `shopify.app.toml` webhooks only lists `app/uninstalled` and `app/scopes_update`: [shopify.app.toml](../shopify.app.toml) (lines 14-21).
- The app implements GDPR endpoints in Express under `/webhooks/*`: [server/routes/gdpr.js](../server/routes/gdpr.js) (lines 17-88).
- There is no evidence in repo of automatic registration for GDPR topics at install time (no `registerWebhooks(...)` usage found).

**Impact**

- Shopify’s App Store review and automated checks can fail if the mandatory compliance topics are not subscribed and reachable.

**Remediation direction**

- Subscribe to mandatory topics:
  - `customers/data_request`
  - `customers/redact`
  - `shop/redact`
- Ensure the configured URIs route to the live endpoints that verify HMAC and respond within Shopify’s documented timeouts.

### High

#### H1) OAuth scope configuration drift (risk: broken auth + “unnecessary scopes” rejection)

**Evidence**

- `shopify.app.toml` declares scopes: [shopify.app.toml](../shopify.app.toml) (line 24): `write_products,write_metaobjects,write_metaobject_definitions`
- React Router Shopify config reads scopes from `process.env.SCOPES`: [app/shopify.server.js](../app/shopify.server.js) (line 14).
- Express JWT verifier uses scopes from `process.env.SHOPIFY_SCOPES`: [server/middleware/auth.js](../server/middleware/auth.js) (line 8).
- `.env.example` documents `SHOPIFY_SCOPES` but not `SCOPES` or `SHOPIFY_APP_URL`: [.env.example](../.env.example) (lines 4-14).

**Impact**

- Broken install/auth if scopes aren’t set where the runtime expects them.
- Higher chance of review rejection if the requested scopes are not justified by app functionality (the current app doesn’t appear to need `write_products` or metaobject definition writes for the diamond widget flow).

**Remediation direction**

- Pick one canonical env var naming scheme and enforce it across:
  - `shopify.app.toml`
  - deployment env vars
  - app runtime config (`app/shopify.server.js`)
  - Express verification middleware
- Reduce requested scopes to the minimum required by real features (not template defaults).

#### H2) Public storefront endpoints are easily abusable (spam/DoS/data pollution)

**Evidence**

- `/api/public/diamonds` only checks caller-supplied `shop` against an existing session row: [server/routes/diamonds.js](../server/routes/diamonds.js) (lines 20-35).
- `/api/public/enquiry` writes an `Order` record based on attacker-supplied input, gated only by `shop` existence in the sessions table: [server/routes/enquiry.js](../server/routes/enquiry.js) (lines 4-33).
- Global permissive CORS is enabled for the whole Express app: [server/index.js](../server/index.js) (line 13).

**Abuse path**

- Any third party can spam `/api/public/enquiry` for any shop that has a session row (installed at some point), creating unlimited “pending orders” and storing arbitrary JSON in `diamondDetails`.

**Impact**

- DB growth / cost, operational noise, potential merchant impact.
- Privacy concerns (storing and logging personal data without controls).

**Remediation direction**

- Add rate limiting + abuse controls for public routes (IP-based, shop-based, and/or CAPTCHA).
- Validate payload size and schema strictly.
- Consider a per-shop shared secret/signature for storefront calls, or use Shopify-approved patterns (for example, app proxy patterns) depending on architecture.
- Enforce merchant “isActive/widgetEnabled” gating if the product requires it.

#### H3) Billing webhook route is a placeholder and lacks HMAC verification

**Evidence**

- Billing webhook handler explicitly TODOs HMAC verification and DB updates: [server/routes/billing.js](../server/routes/billing.js) (lines 5-14).

**Impact**

- If you subscribe this endpoint as a Shopify webhook in production, it’s currently unauthenticated and can be called by anyone to trigger “billing event handling” logic once implemented.
- Missing billing enforcement can also lead to App Store review issues if your app is paid.

**Remediation direction**

- Implement HMAC verification and idempotency for billing webhooks before subscribing them.
- Decide whether the app is free or paid, then implement Managed Pricing or Billing API flows accordingly.

### Medium

#### M1) GDPR endpoints log customer email (PII) to logs

**Evidence**

- Logs include `email=` for redact and data_request: [server/routes/gdpr.js](../server/routes/gdpr.js) (lines 26 and 81-83).

**Impact**

- PII in logs increases breach impact and may complicate compliance and retention policies.

**Remediation direction**

- Avoid logging raw email; log a hash, redact, or log only the request id/shop and internal record counts.

#### M2) Error handler reflects raw error messages to clients

**Evidence**

- Express error handler returns `err.message` verbatim: [server/middleware/errorHandler.js](../server/middleware/errorHandler.js) (lines 3-12).

**Impact**

- Potential information leakage (internal errors, upstream messages).

**Remediation direction**

- Return generic messages to clients; log detailed errors server-side with request correlation ids.

#### M3) Lint failures indicate inconsistent runtime assumptions (Node globals in mixed environments)

**Evidence**

- `npm run lint` fails with `process is not defined` and other errors across React Router routes and server files (34 errors total).

**Impact**

- Not a direct security issue, but it’s a strong quality signal: reviewers are likely to hit broken flows where code assumes Node globals in browser contexts or vice versa.

**Remediation direction**

- Fix lint config or code patterns so server-only files are linted with a Node environment and browser files do not reference Node globals.

### Low

#### L1) Theme extension configuration is “global URL” based (operational footgun)

**Evidence**

- Theme block requires an `API Server URL` to be configured, defaulting to a fixed Railway domain: [extensions/diamond-widget/blocks/diamond-browser.liquid](../extensions/diamond-widget/blocks/diamond-browser.liquid) (lines 26-31).

**Impact**

- Merchants can accidentally point storefront widget at the wrong environment or stale domain.

**Remediation direction**

- Consider making the widget discover the app endpoint more safely (for example via app proxy / stable per-app domain patterns) and document clearly.

## Positive Notes (What Looks Good)

- Theme extension Liquid uses `escape` for settings that become HTML attributes: [diamond-browser.liquid](../extensions/diamond-widget/blocks/diamond-browser.liquid) (lines 5 and 8).
- Storefront widget renders API-provided diamond fields using DOM APIs + `textContent` (not `innerHTML`), reducing XSS risk: [diamond-widget.js](../extensions/diamond-widget/assets/diamond-widget.js) (`renderCards` function).
- Webhook HMAC verification uses a timing-safe compare: [server/services/shopifyApi.js](../server/services/shopifyApi.js).

## Recommended “Fix Order” (For When You’re Ready To Change Code)

1. Fix production topology so the embedded UI and OAuth callback work at `application_url` (C1).
2. Fix Prisma Session schema so Shopify session storage works reliably (C2).
3. Add mandatory compliance webhook subscriptions + ensure endpoints are reachable and verified (C3).
4. Normalize scope/env configuration and reduce scopes to minimum necessary (H1).
5. Add abuse controls on public endpoints (H2) and implement billing securely if needed (H3).
6. Reduce PII logging and error leakage (M1, M2).
7. Address lint failures to stabilize dev + review experience (M3).

