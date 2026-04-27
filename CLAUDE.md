# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Read this ENTIRE file before doing ANYTHING.
> Zero code until this is fully read.

## PROJECT
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

## COMMANDS

```bash
# After running: shopify app init (choose Remix template)

# Local dev — starts both Remix + Shopify tunnel
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
Phase 1: App init + DB + OAuth          [NOT STARTED]
Phase 2: GDPR webhooks + auth           [NOT STARTED]
Phase 3: Express API + Payal API        [NOT STARTED]
Phase 4: Theme Extension widget         [NOT STARTED]
Phase 5: Order flow end to end          [NOT STARTED]
Phase 6: Billing API                    [NOT STARTED]
Phase 7: Testing + polish               [NOT STARTED]
Phase 8: App Store submit               [NOT STARTED]
