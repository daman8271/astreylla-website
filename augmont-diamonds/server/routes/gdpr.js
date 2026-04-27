import { Router } from "express";

const router = Router();

// POST /webhooks/customers/redact
// Shopify requests deletion of a customer's personal data from our DB.
// Mandatory for App Store approval.
router.post("/customers/redact", async (req, res, next) => {
  // TODO: verify webhook HMAC signature
  // TODO: delete or anonymise customer data from orders table
  res.sendStatus(200);
});

// POST /webhooks/shop/redact
// Shopify requests deletion of all data for a shop (merchant uninstalled).
// Mandatory for App Store approval.
router.post("/shop/redact", async (req, res, next) => {
  // TODO: verify webhook HMAC signature
  // TODO: delete all rows for req.body.shop_domain from sessions, merchants, orders, subscriptions
  res.sendStatus(200);
});

// POST /webhooks/customers/data_request
// Shopify asks us to report what customer data we hold.
// Mandatory for App Store approval.
router.post("/customers/data_request", async (req, res, next) => {
  // TODO: verify webhook HMAC signature
  // TODO: query orders table for customer data by shop + customer_id
  // TODO: send report back to Shopify via Admin API (shopifyApi.sendDataReport)
  res.sendStatus(200);
});

export default router;
