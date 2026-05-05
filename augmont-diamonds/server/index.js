import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createRequestHandler } from "@react-router/express";
import * as remixBuild from "../build/server/index.js";
import diamondsRouter, { handlePublicDiamonds } from "./routes/diamonds.js";
import { handlePublicEnquiry } from "./routes/enquiry.js";
import ordersRouter from "./routes/orders.js";
import gdprRouter from "./routes/gdpr.js";
import cartRouter, { handlePublicOrderCreate } from "./routes/cart.js";
import billingRouter from "./routes/billing.js";
import adminRouter from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { publicRateLimit, publicRateLimitPerShop } from "./middleware/rateLimit.js";
import { validateMerchantWidget } from "./middleware/validateMerchantWidget.js";

// CORS allowlist for all routes (storefront /api/public/*, admin /api/*,
// webhook /webhooks/*, auth /auth/*).
//
// Allowed:
//   - any *.myshopify.com   (merchant storefronts)
//   - explicit non-myshopify hostnames go in this Set (currently just
//     admin.shopify.com for embedded admin)
//
// "No Origin" requests (server-to-server, curl, mobile WebViews, health
// checks) are allowed because CORS is browser-only — non-browser callers
// are gated by other middleware (rate limits, widget gate, HMAC). For
// /webhooks/*, Shopify is server-to-server (no Origin) so CORS is a
// no-op there; HMAC verification is the real auth boundary.
//
// Custom merchant storefront domains (e.g. payaldiamonds.com instead of
// payaldiamonds.myshopify.com) are NOT allowlisted here. Phase E
// follow-up: add a Merchant.allowedOrigins JSON column and check against
// the per-shop list. Until then, custom-domain storefronts will be
// CORS-blocked and surface as `[cors] blocked origin: ...` warnings in
// Railway logs.
const ALLOWED_HOSTNAMES = new Set(["admin.shopify.com"]);

function corsOriginCheck(origin, callback) {
  // No Origin header — server-to-server, curl, mobile WebViews, health
  // checks. CORS is a browser-only policy; non-browser callers are gated
  // by other middleware (rate limits, widget gate, HMAC).
  if (!origin) return callback(null, true);

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    console.warn(`[cors] invalid Origin header rejected: ${origin}`);
    return callback(null, false);
  }

  const { hostname } = parsed;
  if (hostname.endsWith(".myshopify.com")) return callback(null, true);
  if (ALLOWED_HOSTNAMES.has(hostname)) return callback(null, true);

  // Phase C dev shim: when running locally for the widget test harness, allow
  // localhost / 127.0.0.1 so the harness on :3000 can call the API on :4000.
  // Gated on NODE_ENV=development so production never sees this branch.
  if (
    process.env.NODE_ENV === "development" &&
    (hostname === "localhost" || hostname === "127.0.0.1")
  ) {
    return callback(null, true);
  }

  console.warn(`[cors] blocked origin: ${origin}`);
  return callback(null, false);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);
// First middleware after trust-proxy: stamp every request with a UUID and
// echo it back as X-Request-Id. Runs before cors/body-parsers/routes so even
// rejected requests (cors, rate-limit, validation, body-parse fail) get a
// correlation id customers can quote in support.
app.use(requestId);
app.use(cors({ origin: corsOriginCheck }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_BUILD_DIR = resolve(__dirname, "..", "build", "client");

// Body parsers are scoped per Express-owned subpath. The @react-router/express
// adapter constructs the Remix Request body via createReadableStreamFromReadable(req).
// A global express.json() would consume the stream and starve Remix POST routes
// (webhooks.app.uninstalled, webhooks.app.scopes_update, future actions).
const apiJson = express.json({ limit: "1mb" });
const webhookJson = express.json({
  limit: "1mb",
  verify: (req, _res, buf) => { req.rawBody = buf; },
});

app.use("/api", apiJson);

// /webhooks/* is split: customers/shop are Express-owned (need rawBody
// for HMAC); /webhooks/app/* are Remix routes that must not be JSON-parsed here
// so that authenticate.webhook(request) can read the body itself.
app.use((req, res, next) => {
  if (
    req.path.startsWith("/webhooks/customers/") ||
    req.path.startsWith("/webhooks/shop/")
  ) {
    return webhookJson(req, res, next);
  }
  return next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Layered guards on every /api/public/* route:
//   1. publicRateLimit         — per-IP cap (defends one-source flooding)
//   2. publicRateLimitPerShop  — per-shop cap (defends rotating-IP attacks
//      that target one merchant; reads shop from body or query)
//   3. validateMerchantWidget  — confirms shop has a Session and the
//      merchant has explicitly enabled the widget (DB hit, runs only after
//      both rate-limits pass so spam doesn't burn DB)
app.use("/api/public", publicRateLimit);
app.use("/api/public", publicRateLimitPerShop);
app.use("/api/public", validateMerchantWidget);
app.get("/api/public/diamonds", handlePublicDiamonds);
app.post("/api/public/enquiry", handlePublicEnquiry);
app.use("/api/public/cart", cartRouter);
app.post("/api/public/order/create", handlePublicOrderCreate);

app.use("/api/diamonds", diamondsRouter);
app.use("/api/orders", ordersRouter);
// Phase F7: owner-only admin endpoints (billing toggle today, more later).
// JSON body parser already mounted on /api above. Each endpoint inside the
// router applies verifySessionToken + isOwnerShop guards itself — no global
// gate at this prefix in case future read-only admin endpoints want
// different auth.
app.use("/api/admin", adminRouter);

app.use("/webhooks", gdprRouter);
// Phase F7: billing routes scaffolding. The router applies billingGate
// middleware to every route on it; with the global flag OFF (default),
// the gate short-circuits before any handler runs.
app.use("/webhooks/billing", billingRouter);

// Static client bundles. Vite emits hashed JS/CSS into build/client/assets —
// content-addressed, safe to cache forever. The build/client root holds favicon
// and other public files at a shorter cache.
app.use(
  "/assets",
  express.static(resolve(CLIENT_BUILD_DIR, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static(CLIENT_BUILD_DIR, { maxAge: "1h", index: false }));

// Express error handler scoped to Express-owned paths only. Errors on Remix
// paths bubble through to Remix's own error boundary.
app.use((err, req, res, next) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/webhooks/customers/") ||
    req.path.startsWith("/webhooks/shop/") ||
    req.path === "/health"
  ) {
    return errorHandler(err, req, res, next);
  }
  return next(err);
});

// Remix React Router catch-all — MUST be last. The adapter reads the request
// body from the Express req stream, which is intact thanks to the path-scoped
// parsers above.
app.all(
  "*",
  createRequestHandler({
    build: remixBuild,
    mode: process.env.NODE_ENV,
  })
);

// Last-resort error handler for crashes outside the Remix React tree.
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT} (NODE_ENV=${process.env.NODE_ENV ?? "development"})`);
  console.log(`[server] static client: ${CLIENT_BUILD_DIR}`);
});
