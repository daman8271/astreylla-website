# 💎 Payal Diamond — Shopify App

A Shopify embedded app that connects independent jewellers to Payal's wholesale diamond catalog. Customers browse diamonds on the jeweller's storefront, orders flow through to Payal's existing API, and Payal ships directly.

---

## 📋 Overview

Payal is a wholesale diamond supplier with an existing live order API. Independent jewellers want to sell her diamond catalog from their own Shopify stores without holding inventory.

This app sits between the two:

1. A jeweller installs the app on their Shopify store
2. They embed a diamond browser widget on their storefront via a Shopify Theme Extension
3. Customers browse the live catalog and place orders through the widget
4. Orders are forwarded to Payal's API; Payal fulfils and ships
5. The jeweller earns margin without managing inventory

The app is built to pass Shopify App Store review, including all three mandatory GDPR webhooks, OAuth 2.0, Session Token authentication, and the Shopify Billing API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Remix (via Shopify CLI) |
| Frontend | React + Shopify Polaris |
| Embedded auth | App Bridge 3.0 + Session Tokens |
| Storefront widget | Shopify Theme Extension (Liquid + vanilla JS) |
| Admin API | GraphQL Admin API |
| Backend | Node.js + Express |
| Database | PostgreSQL on Supabase |
| ORM | Prisma |
| Hosting | Railway (Remix app + Express API) |
| Asset CDN | Shopify (auto-hosted via `/extensions`) |

---

## 🏗️ Architecture

```
[Shopify Admin]──OAuth──► [Remix app :3000]──fetch──► [Express API :4000]──► [Payal's API]
                                │                              │
                          [App Bridge]                    [Prisma ORM]
                                                                │
                                                       [Supabase Postgres]

[Merchant storefront]──► [Theme Extension JS]──fetch──► [Express API :4000]
```

The Remix app handles everything Shopify-side — OAuth install flow, session tokens, admin UI via Polaris. It never talks to Payal's API directly; it always proxies through the Express server.

The Express API is the sole integration point with Payal. It verifies Shopify session tokens on every request, calls Payal's API, persists orders and merchants, and serves the storefront widget.

The Theme Extension is plain JS + Liquid deployed via Shopify's CDN. It calls the Express API directly from the buyer's browser, bypassing the Remix app entirely.

---

## 📁 Folder Structure

```
payal-diamond-app/
├── app/                          Remix app — admin dashboard
│   ├── routes/
│   │   ├── app._index.jsx        Dashboard home
│   │   ├── app.settings.jsx      Jeweller settings
│   │   ├── app.orders.jsx        Orders view
│   │   ├── app.diamonds.jsx      Diamond catalog
│   │   ├── auth.$.jsx            OAuth callback
│   │   └── webhooks.jsx          GDPR + billing receivers
│   ├── components/
│   │   ├── DiamondTable.jsx
│   │   ├── DiamondFilters.jsx
│   │   ├── OrdersList.jsx
│   │   ├── SettingsForm.jsx
│   │   └── BillingBanner.jsx
│   └── utils/
│       ├── api.server.js         Calls Express API (server-side only)
│       └── shopify.server.js     Shopify config (auto-generated)
│
├── extensions/
│   └── diamond-widget/           Storefront Theme Extension
│       ├── blocks/
│       │   └── diamond-browser.liquid
│       ├── assets/
│       │   ├── diamond-widget.js
│       │   └── diamond-widget.css
│       └── shopify.extension.toml
│
├── server/                       Express API — bridge to Payal
│   ├── routes/
│   │   ├── diamonds.js
│   │   ├── orders.js
│   │   ├── billing.js
│   │   └── gdpr.js
│   ├── middleware/
│   │   ├── auth.js               Session token verification
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── payalApi.js
│   │   ├── shopifyApi.js
│   │   └── prismaClient.js
│   └── index.js
│
├── prisma/
│   ├── schema.prisma             4 tables (PostgreSQL)
│   └── migrations/               Auto-generated — never edit
│
├── .env.example
├── shopify.app.toml              Scopes, URLs, webhooks
├── Procfile                      Railway start commands
├── package.json
├── README.md                     This file
├── CLAUDE.md                     AI assistant instructions
├── WORK_LOG.md                   Session-by-session build log
└── PROJECT_MASTER.md             Single source of truth
```

---

## 🚀 Getting Started

### 📦 Prerequisites

- Node.js 18+
- npm 10+
- A Shopify Partner account (free)
- A Shopify development store
- A Supabase project (free tier is fine)
- The Shopify CLI: `npm install -g @shopify/cli @shopify/app`

### ⬇️ Installation

```bash
# Clone the repo
git clone <repo-url>
cd payal-diamond-app

# Install dependencies (Remix app)
cd augmont-diamonds
npm install

# Install dependencies (Express server)
cd ../server
npm install

# Copy env template and fill in values
cd ..
cp .env.example .env
```

Open `.env` and populate every variable in the table below.

---

## 🔐 Environment Variables

All variables live in `.env` (never committed). A blank template is in `.env.example`.

| Variable | Description |
|----------|-------------|
| `SHOPIFY_API_KEY` | App client ID from the Shopify Partner Dashboard |
| `SHOPIFY_API_SECRET` | App client secret from the Shopify Partner Dashboard |
| `SHOPIFY_SCOPES` | OAuth scopes the app requests (e.g. `read_products,write_orders`) |
| `DATABASE_URL` | Supabase **pooled** connection string — used by Prisma at runtime |
| `DIRECT_URL` | Supabase **direct** connection string — used by `prisma migrate` |
| `PAYAL_API_URL` | Base URL of Payal's existing diamond/order API |
| `PAYAL_API_KEY` | Auth token for Payal's API |
| `SESSION_SECRET` | Random string used to sign session cookies |
| `PORT` | Port the Express API listens on (default `4000`) |
| `NODE_ENV` | `development` locally, `production` on Railway |

> Supabase exposes two URLs. Prisma needs both: pooled for app queries, direct for migrations.

---

## 🗄️ Database Setup

The database lives in Supabase. Schema is defined in `prisma/schema.prisma` (4 tables: `sessions`, `merchants`, `orders`, `subscriptions`).

```bash
# Generate the Prisma client after pulling
npx prisma generate

# Apply pending migrations to the database
npx prisma migrate deploy

# Create a new migration after changing schema.prisma
npx prisma migrate dev --name <descriptive_name>

# Open the Prisma Studio DB browser
npx prisma studio
```

> The `sessions` table is managed by `@shopify/shopify-app-session-storage-prisma`. Do not modify its fields manually.

---

## 💻 Development

Local development requires four terminals running side by side. The Remix app and the Express API must both be reachable, and the Theme Extension widget needs the Express API exposed via a public URL.

### ▶️ Terminal 1 — Remix app + Shopify tunnel

```bash
cd augmont-diamonds
shopify app dev
```

Spins up Remix on `:3000`, opens a Cloudflare tunnel, and prints the install URL for your dev store.

### ▶️ Terminal 2 — Express API

```bash
cd server
node index.js
```

Listens on `:4000`. Restart manually after code changes (or use `nodemon`).

### ▶️ Terminal 3 — Express public tunnel

```bash
ngrok http 4000
```

Produces a public URL the Theme Extension widget can call from the buyer's browser. Update the widget's API base URL to match.

### ▶️ Terminal 4 — Prisma Studio (optional)

```bash
npx prisma studio
```

Opens a DB browser on `:5555` for inspecting `sessions`, `merchants`, `orders`, and `subscriptions` while testing.

---

## 📊 Build Phases

The build is split into eight phases. Each phase is shippable on its own. Status is tracked in `WORK_LOG.md` after every session.

| # | Phase | Status |
|---|-------|--------|
| 1 | Shopify app init + Supabase DB + OAuth flow | 🟡 In Progress (95%) |
| 2 | GDPR webhooks + Session Token auth middleware | ⏳ Not Started |
| 3 | Express API + integration with Payal's API | ⏳ Not Started |
| 4 | Theme Extension storefront widget | ⏳ Not Started |
| 5 | End-to-end order flow (widget → Express → Payal) | ⏳ Not Started |
| 6 | Shopify Billing API + subscription management | ⏳ Not Started |
| 7 | Testing, error handling, accessibility pass | ⏳ Not Started |
| 8 | App Store submission prep + review | ⏳ Not Started |

See `PROJECT_MASTER.md` for the per-phase task checklist.

---

## 🚢 Deployment

Both the Remix app and the Express API are co-deployed to a single Railway project.

### ⚙️ One-time setup

```bash
npm install -g @railway/cli
railway login
railway init
```

In the Railway dashboard, add every variable from the [Environment Variables](#environment-variables) table, plus `NODE_ENV=production`.

### 🚀 Deploy

```bash
railway up
```

Or push to GitHub if the Railway GitHub integration is enabled — Railway will auto-deploy on every push to `main`.

### 📜 Procfile

The `Procfile` at the project root tells Railway how to start both services:

```
web: node server/index.js
remix: npx remix-serve build/server/index.js
```

### ✅ Post-deploy checks

- `GET /health` returns `200 OK`
- OAuth install flow completes on a dev store using the Railway URL
- GDPR webhooks register and verify successfully in the Partner Dashboard
- Supabase connection succeeds (check Railway logs for the Prisma startup message)
- Theme Extension is published via `shopify app deploy`

---

## 🔌 API Reference

All routes are served by the Express API. Every route except `/health` and `/auth/callback` requires a valid Shopify session token verified by `middleware/auth.js`.

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | 🟢 GET | `/health` | Health check used by Railway to confirm the server is up |
| 2 | 🟢 GET | `/auth/callback` | Shopify OAuth callback — exchanges code for access token |
| 3 | 🟠 POST | `/webhooks/customers/redact` | GDPR — delete customer personal data on request |
| 4 | 🟠 POST | `/webhooks/shop/redact` | GDPR — delete all shop data when a merchant uninstalls |
| 5 | 🟠 POST | `/webhooks/customers/data_request` | GDPR — fulfil a customer data export request |
| 6 | 🟢 GET | `/api/diamonds` | List diamonds from Payal's API (supports filter params) |
| 7 | 🟢 GET | `/api/diamonds/:id` | Fetch a single diamond by ID |
| 8 | 🟠 POST | `/api/orders` | Submit a customer order to Payal's API and persist to DB |
| 9 | 🟠 POST | `/webhooks/billing` | Handle Shopify billing events (activated, cancelled, frozen) |

---

## 🤝 Contributing

This is a focused build with strict working rules:

1. **One task per session.** Stop when it's done. No stacking features.
2. **Read before editing.** Read the file before changing it.
3. **Test before declaring done.** Verify the change works.
4. **Commit after every working feature.** Small, descriptive commits.
5. **No new packages without justification.** If a dependency is added, the commit message says why.
6. **If something might break existing work — stop and ask.** No silent rewrites.
7. **Update `WORK_LOG.md` at the end of every session.** Date, phase, what was built, what's next, blockers.

The full working contract lives in `CLAUDE.md`.

---

## 📄 License

Proprietary. All rights reserved.

This software is built for Payal Diamond and is not licensed for redistribution, modification, or commercial use by third parties without prior written consent.
