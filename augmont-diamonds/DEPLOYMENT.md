# Railway Deployment Guide — augmont-diamonds

## Architecture on Railway

Two servers run as a single Railway service:
- **Remix app** (React Router) — Railway's external port (PORT env var), serves the Shopify admin UI
- **Express API** — internal port 4000, handles diamond/order API calls and GDPR webhooks

## Prerequisites

1. [Railway CLI](https://docs.railway.app/develop/cli) installed: `npm i -g @railway/cli`
2. Railway account with a project created
3. Supabase database provisioned (get your `DATABASE_URL` and `DIRECT_URL`)
4. Shopify Partner account with app credentials

## Environment Variables

Set all of these in your Railway service dashboard (Settings → Variables):

> Source of truth: `.env.example`. Verify the list with
> `grep -RhoE "process\.env\.[A-Z_][A-Z0-9_]*" app server | sort -u`.

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_API_KEY` | Shopify app client ID from Partner dashboard | `abc123...` |
| `SHOPIFY_API_SECRET` | Shopify app client secret | `shpss_...` |
| `SCOPES` | OAuth scopes — keep aligned with `shopify.app.toml [access_scopes].scopes` | `read_products` |
| `SHOPIFY_APP_URL` | Public app URL on Railway | `https://<your-railway-domain>.up.railway.app` |
| `SHOP_CUSTOM_DOMAIN` | Optional custom domain to allowlist for the session adapter | _(blank)_ |
| `HOST` | Hostname used by the Shopify session-token verifier for `iss` claim validation | `<your-railway-domain>.up.railway.app` |
| `DATABASE_URL` | Supabase **pooled** connection URL — MUST include `?pgbouncer=true&connection_limit=1` (see CLAUDE.md "Prisma + Supabase PgBouncer rule") | `postgresql://…pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase **direct** (non-pooled) URL for `prisma migrate` — MUST NOT include the pgbouncer flag | `postgresql://…pooler.supabase.com:5432/postgres` |
| `AUGMONT_BASE_URL` | Augmont LGD API base URL | `https://api.uatlgd.augmont.com/api/v1` |
| `PAYAL_API_USERNAME` | Augmont merchant login username | _(from Payal)_ |
| `PAYAL_API_PASSWORD` | Augmont merchant login password | _(from Payal)_ |
| `EXPRESS_API_URL` | Internal URL the Remix admin loaders use to call the Express API | `http://localhost:4000` |
| `NODE_ENV` | Must be `production` on Railway | `production` |
| `PORT` | Set automatically by Railway — do NOT set manually | _(auto)_ |

## Build & Deploy Steps

### First deployment

```bash
# 1. Log in to Railway
railway login

# 2. Link to your Railway project
railway link

# 3. Push and deploy
railway up
```

Railway will automatically:
- Detect Node.js via Nixpacks
- Run `npm install` and `npm run build` (compiles Remix + Prisma client)
- Start both servers via `npm run start`

### Subsequent deployments

```bash
railway up
```

Or connect your GitHub repo in Railway dashboard for automatic deploys on push.

## Post-deployment Setup

### Run database migrations

After the first deploy, run Prisma migrations against production:

```bash
railway run npx prisma migrate deploy
```

### Update Shopify app URLs

In Shopify Partner dashboard → App setup, set:
- **App URL**: `https://<your-railway-domain>.railway.app`
- **Allowed redirection URL**: `https://<your-railway-domain>.railway.app/auth/callback`

### Update shopify.app.toml

```toml
application_url = "https://<your-railway-domain>.railway.app"
```

## Health Check

Railway pings `/health` to confirm the service is running.

```bash
# Verify health check locally after build:
npm run build
npm run start &
curl http://localhost:3000/health   # Remix: {"status":"ok"}
curl http://localhost:4000/health   # Express: {"status":"ok"}
```

In production Railway will show the service as "Active" once `/health` returns 200.

## Logs

```bash
railway logs
```

## Rollback

In Railway dashboard → Deployments, click any previous deployment → "Redeploy".

## Common Issues

| Issue | Fix |
|-------|-----|
| Build fails on `prisma generate` | Ensure `DATABASE_URL` is set in Railway vars |
| Health check timeout | Check logs — Express may be crashing on startup |
| Shopify OAuth redirect error | Update App URL + redirect URL in Partner dashboard |
| `PORT` conflict | Do not set PORT manually — Railway assigns it |
