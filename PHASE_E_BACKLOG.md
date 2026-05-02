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
