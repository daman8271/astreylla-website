# Astreylla Website — Railway Deployment Guide (Hinglish/English)

Aapka project ek **Monorepo** structure hai jisme do domains deploy honge:
1. **Backend API (`augmont-diamonds`)**: Shopify Remix app + Express API (e.g., `api.astreylla.com`)
2. **Frontend (`estrella-frontend`)**: Next.js Website (e.g., `astreylla.com` & `www.astreylla.com`)

---

## 📋 Table of Contents
1. [Prerequisites (Tayaari)](#1-prerequisites-tayaari)
2. [Step 1: Database Setup (Supabase)](#step-1-database-setup-supabase)
3. [Step 2: Deploying the Backend (`augmont-diamonds`)](#step-2-deploying-the-backend-augmont-diamonds)
4. [Step 3: Deploying the Frontend (`estrella-frontend`)](#step-3-deploying-the-frontend-estrella-frontend)
5. [Step 4: Custom Domain Setup (DNS Config)](#step-4-custom-domain-setup-dns-config)
6. [Step 5: Run Database Migrations](#step-5-run-database-migrations)
7. [Step 6: Shopify Partner Dashboard Config](#step-6-shopify-partner-dashboard-config)

---

## 1. Prerequisites (Tayaari)
* **GitHub Repository**: Dono folders (`estrella-frontend` aur `augmont-diamonds`) ek single Git repository me pushed hone chahiye.
* **Railway Account**: [Railway.app](https://railway.app) par account setup karein.
* **Domain DNS Access**: Cloudflare, GoDaddy, ya Namecheap par aapke domain settings ka access hona chahiye takki DNS records update kiye ja sakein.

---

## Step 1: Database Setup (Supabase)
Backend (Prisma) ko use karne ke liye ek PostgreSQL database chahiye. Agar aapne already setup kar rakha hai, toh in connections ki zarurat hogi:

1. **`DATABASE_URL` (Pooled Connection)**: Supabase dashboard -> Settings -> Database -> Connection string (select **Transaction/Session** mode, default port 6543).
   * **Important**: String ke end me `?pgbouncer=true&connection_limit=1` add karna na bhulein.
   * Example: `postgresql://postgres:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
2. **`DIRECT_URL` (Direct Connection)**: Direct migration ke liye (default port 5432).
   * Example: `postgresql://postgres:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

---

## Step 2: Deploying the Backend (`augmont-diamonds`)

1. **Railway Project Banayein**:
   * Railway dashboard me jaakar **New Project** -> **Deploy from GitHub repo** select karein.
   * Apne repository (`astreylla-website`) ko select karein.
2. **Service Setup**:
   * Deployment shuru hone par use stop karein (kyunki abhi hume root directory adjust karni hai).
   * Service settings me jaakar tab **Settings** par click karein.
   * **Root Directory** ko change karke `/augmont-diamonds` set karein.
   * **Service Name** ko rename karke `astreylla-backend` rakh sakte hain.
3. **Environment Variables Add Karein**:
   Railway -> Settings -> **Variables** me jaakar niche diye gaye variables add karein:

   | Key | Description | Example |
   |-----|-------------|---------|
   | `NODE_ENV` | Environment mode | `production` |
   | `SHOPIFY_API_KEY` | Shopify Client ID | `your_shopify_api_key` |
   | `SHOPIFY_API_SECRET` | Shopify Client Secret | `your_shopify_secret` |
   | `SCOPES` | OAuth permissions | `read_products` |
   | `SHOPIFY_APP_URL` | Deployed Backend URL | `https://api.astreylla.com` |
   | `HOST` | Backend domain without protocol | `api.astreylla.com` |
   | `DATABASE_URL` | Supabase Pooled Connection | _(Supabase String with pgbouncer)_ |
   | `DIRECT_URL` | Supabase Direct Connection | _(Supabase Direct String)_ |
   | `AUGMONT_BASE_URL` | Payal's Diamond API URL | `https://api.uatlgd.augmont.com/api/v1` (UAT) or Prod |
   | `PAYAL_API_USERNAME`| API Username | _(provided by Payal/Bhaiya)_ |
   | `PAYAL_API_PASSWORD`| API Password | _(provided by Payal/Bhaiya)_ |
   | `EXPRESS_API_URL` | Internal routing URL | `http://localhost:4000` |

   > **Note**: Railway automatic `PORT` assign karega. Aapko `PORT` variable set nahi karna hai.

4. **Health Check Warning**:
   * Backend me `railway.json` already present hai jo path `/health` ko monitor karta hai. Railway verify karega ki start script correctly chal rahi hai.

---

## Step 3: Deploying the Frontend (`estrella-frontend`)

Ab Next.js app ko deploy karne ke liye, hum same GitHub repo se ek doosra service add karenge.

1. **New Service Add Karein**:
   * Railway project dashboard me click karein **New** -> **GitHub Repo**.
   * Same repository (`astreylla-website`) select karein.
2. **Service Settings**:
   * Service card select karke **Settings** tab me jayein.
   * **Root Directory** ko `/estrella-frontend` set karein.
   * **Service Name** ko `astreylla-frontend` rename karein.
3. **Environment Variables Add Karein**:
   Is service ke variables me ye set karein:

   | Key | Description | Example Value |
   |-----|-------------|---------------|
   | `SHOPIFY_STORE_DOMAIN` | Shopify storefront domain | `trial-shop-sqxnl71f.myshopify.com` |
   | `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Public storefront token | _(From Shopify App settings)_ |
   | `NEXT_PUBLIC_DIAMOND_WIDGET_API_URL` | Backend Endpoint | `https://api.astreylla.com` (Aapka Backend Domain) |
   | `NEXT_PUBLIC_BUNNY_CDN` | Assets CDN | `https://akoirah-live.b-cdn.net` |

---

## Step 4: Custom Domain Setup (DNS Config)

Railway automatic free `.up.railway.app` domains deta hai, par custom domain ke liye niche steps follow karein:

### A. Backend Domain Setup (`api.astreylla.com`)
1. Railway backend service -> **Settings** -> **Domains** me click karein **Add Domain** -> **Custom Domain**.
2. Domain enter karein: `api.astreylla.com`.
3. Railway aapko ek **CNAME record** dega.
   * *Example: `api.astreylla.com CNAME active-backend-xxx.up.railway.app`*
4. Apne DNS Manager (Cloudflare, GoDaddy etc.) me jaakar ye record add karein.

### B. Frontend Domain Setup (`astreylla.com`)
1. Frontend service -> **Settings** -> **Domains** -> **Custom Domain**.
2. Domain enter karein: `astreylla.com`.
3. Railway aapko ek **CNAME** or **A record** dega.
4. Apne DNS Manager me use add karein. `www.astreylla.com` ke liye bhi same process karein.

---

## Step 5: Run Database Migrations
Ek baar jab database credentials configured ho jayein aur app build successfully ho jaye, tab aapko production database structure create karna hoga.

Apne local terminal me, project root me ye commands run karein:
```bash
# Railway CLI se deploy sync karein
railway login
railway link

# Backend database tables migrate karne ke liye
railway run -s astreylla-backend npx prisma migrate deploy
```
*Ya phir Railway Dashboard me backend service terminal se bhi ise run kar sakte hain.*

---

## Step 6: Shopify Partner Dashboard Config
Aapki backend application Shopify App authentication use karti hai, isliye Shopify console ko nayi URLs ke baare me batana hoga:

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com).
2. Click on **Apps** -> Select **Payal Diamond App** (ya jo bhi app ka naam ho).
3. **App Setup** section me jayein:
   * **App URL**: `https://api.astreylla.com`
   * **Allowed redirection URL(s)**: `https://api.astreylla.com/auth/callback`
4. Update karke save karein.
