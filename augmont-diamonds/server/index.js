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
import { errorHandler } from "./middleware/errorHandler.js";
import { publicRateLimit } from "./middleware/rateLimit.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);
app.use(cors());

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

app.use("/api/public", publicRateLimit);
app.get("/api/public/diamonds", handlePublicDiamonds);
app.post("/api/public/enquiry", handlePublicEnquiry);
app.use("/api/public/cart", cartRouter);
app.post("/api/public/order/create", handlePublicOrderCreate);

app.use("/api/diamonds", diamondsRouter);
app.use("/api/orders", ordersRouter);

app.use("/webhooks", gdprRouter);

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
