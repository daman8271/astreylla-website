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

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_API_KEY` | From Shopify Partner dashboard | `abc123...` |
| `SHOPIFY_API_SECRET` | From Shopify Partner dashboard | `shpss_...` |
| `SHOPIFY_SCOPES` | OAuth scopes required | `read_products,write_orders` |
| `DATABASE_URL` | Supabase pooled connection URL | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection URL (for Prisma migrations) | `postgresql://...` |
| `PAYAL_API_URL` | Base URL for Payal's diamond API | `https://api.payal.com` |
| `PAYAL_API_KEY` | Auth key for Payal's API | `pk_live_...` |
| `SESSION_SECRET` | Random secret for session signing (min 32 chars) | `openssl rand -hex 32` |
| `NODE_ENV` | Must be `production` on Railway | `production` |
| `PORT` | Set automatically by Railway — do NOT set manually | — |

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
