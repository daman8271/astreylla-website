import { Router } from "express";
import { verifyWebhookHmac } from "../services/shopifyApi.js";
import prisma from "../services/prismaClient.js";

const router = Router();

function guardHmac(req, res) {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  if (!hmac || !verifyWebhookHmac(req.rawBody, hmac)) {
    console.warn("[gdpr] rejected — invalid HMAC signature");
    res.status(401).json({ error: "Invalid HMAC" });
    return true;
  }
  return false;
}

// POST /webhooks/customers/redact
// Shopify requests deletion of a customer's personal data.
// We delete any orders rows tied to this customer email on this shop.
router.post("/customers/redact", async (req, res, _next) => {
  if (guardHmac(req, res)) return;

  const { shop_domain, customer } = req.body;
  const email = customer?.email;

  console.log(`[gdpr] customers/redact shop=${shop_domain} email=${email}`);

  try {
    if (email && shop_domain) {
      const { count } = await prisma.order.deleteMany({
        where: { shop: shop_domain, customerEmail: email },
      });
      console.log(`[gdpr] customers/redact deleted ${count} order(s)`);
    }
  } catch (err) {
    console.error("[gdpr] customers/redact db error:", err.message);
    // Still return 200 — Shopify will not retry GDPR webhooks on error.
    // Log for manual remediation.
  }

  res.sendStatus(200);
});

// POST /webhooks/shop/redact
// Shopify requests deletion of all data for an uninstalled shop.
// Deletions are ordered by FK dependency: orders → subscriptions → merchants → sessions.
router.post("/shop/redact", async (req, res, _next) => {
  if (guardHmac(req, res)) return;

  const { shop_domain } = req.body;

  console.log(`[gdpr] shop/redact shop=${shop_domain}`);

  try {
    const [orders, subs] = await Promise.all([
      prisma.order.deleteMany({ where: { shop: shop_domain } }),
      prisma.subscription.deleteMany({ where: { shop: shop_domain } }),
    ]);
    const merchant = await prisma.merchant.deleteMany({ where: { shopId: shop_domain } });
    const session = await prisma.session.deleteMany({ where: { shop: shop_domain } });

    console.log(
      `[gdpr] shop/redact complete for ${shop_domain} — ` +
        `orders=${orders.count} subs=${subs.count} merchants=${merchant.count} sessions=${session.count}`
    );
  } catch (err) {
    console.error("[gdpr] shop/redact db error:", err.message);
  }

  res.sendStatus(200);
});

// POST /webhooks/customers/data_request
// Shopify asks what customer data we hold.
// We only store customer email on orders (operational necessity) — logged here for audit trail.
router.post("/customers/data_request", async (req, res, _next) => {
  if (guardHmac(req, res)) return;

  const { shop_domain, customer, data_request } = req.body;

  console.log(
    `[gdpr] customers/data_request id=${data_request?.id} shop=${shop_domain} email=${customer?.email}`
  );
  // No action required: we hold customer email on orders only.
  // If this changes, implement sendDataReport from shopifyApi.js here.

  res.sendStatus(200);
});

export default router;
