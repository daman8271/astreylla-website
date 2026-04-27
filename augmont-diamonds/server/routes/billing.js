import { Router } from "express";

const router = Router();

// POST /webhooks/billing
// Shopify sends billing events here (subscription activated, cancelled, etc.)
// Must respond with 200 quickly — do heavy work async.
router.post("/", async (req, res, next) => {
  // TODO: verify webhook HMAC signature using SHOPIFY_API_SECRET
  // TODO: parse req.body for charge status (active / declined / cancelled)
  // TODO: update subscriptions table in DB accordingly
  // TODO: if cancelled — set merchant.isActive = false
  res.sendStatus(200);
});

export default router;
