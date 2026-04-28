import express from "express";
import cors from "cors";
import diamondsRouter, { handlePublicDiamonds } from "./routes/diamonds.js";
import { handlePublicEnquiry } from "./routes/enquiry.js";
import ordersRouter from "./routes/orders.js";
import billingRouter from "./routes/billing.js";
import gdprRouter from "./routes/gdpr.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

// GET /health — confirms Express server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /auth/callback — Shopify OAuth callback (proxied from Remix if needed)
app.get("/auth/callback", (req, res) => {
  // TODO: handle OAuth token exchange if required outside Remix
  res.json({ message: "auth callback placeholder" });
});

app.get("/api/public/diamonds", handlePublicDiamonds);
app.post("/api/public/enquiry", handlePublicEnquiry);
app.use("/api/diamonds", diamondsRouter);
app.use("/api/orders", ordersRouter);
app.use("/webhooks/billing", billingRouter);
app.use("/webhooks", gdprRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express API running on port ${PORT}`);
});
