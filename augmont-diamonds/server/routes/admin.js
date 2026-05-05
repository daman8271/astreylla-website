// Phase F7 — owner-only admin endpoints.
//
// Mounted at /api/admin in server/index.js, behind the same /api JSON body
// parser as the rest of /api. Two layers of authorization:
//   1. verifySessionToken — confirms the request carries a valid Shopify
//      session token and stamps req.shop with the calling store.
//   2. isOwnerShop(req.shop) — confirms the calling shop is in the
//      OWNER_SHOP_DOMAINS env allowlist. Fail-safe: empty/missing env
//      var → no shops are owners (every request rejected 403).

import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import { isOwnerShop } from "../services/owners.js";
import { invalidateBillingFlagCache } from "../middleware/billingGate.js";
import prisma from "../services/prismaClient.js";

const router = Router();

function requireOwner(req, res, next) {
  if (!isOwnerShop(req.shop)) {
    return res.status(403).json({
      error: "Forbidden — owner-only endpoint.",
      code: "NOT_OWNER",
    });
  }
  next();
}

// POST /api/admin/billing-flag  body: { enabled: boolean }
// Upserts AppConfig key="billing_enabled" with value="true"/"false".
// Invalidates the billingGate cache so the new value takes effect on the
// very next webhook hit (rather than waiting up to 10s for the TTL).
router.post(
  "/billing-flag",
  verifySessionToken,
  requireOwner,
  async (req, res, next) => {
    try {
      const { enabled } = req.body ?? {};
      if (typeof enabled !== "boolean") {
        return res.status(400).json({
          error: "body.enabled must be boolean true/false",
          code: "BAD_REQUEST",
        });
      }
      const value = String(enabled);
      await prisma.appConfig.upsert({
        where:  { key: "billing_enabled" },
        update: { value },
        create: { key: "billing_enabled", value },
      });
      invalidateBillingFlagCache();
      console.log(`[admin] billing-flag set enabled=${enabled} by shop=${req.shop}`);
      return res.json({ ok: true, billingEnabled: enabled });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
