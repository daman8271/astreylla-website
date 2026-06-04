import prisma from "../services/prismaClient.js";

// Storefront widget gate for /api/public/* routes.
//
// Two checks bundled because they always go together: a public request must
// come from an installed shop AND that shop must have explicitly enabled the
// widget via admin Settings (Merchant.widgetEnabled is false by default).
//
// We lazy-create the Merchant row even though this is a "validation"
// middleware. Reason: cart_items.shop and orders.shop both declare an FK to
// merchants.shopId, so the Merchant row must exist before any insert
// downstream succeeds. OAuth doesn't create Merchants — only this code path
// (and the admin Settings loader) does. With widgetEnabled defaulting to
// false, lazy creation is safe: the new row immediately fails the next check
// and the request 403s before any side effect on the storefront flow.

// User-facing copy. Customers (not admins) see this in the storefront widget
// when their merchant hasn't enabled the widget yet, so the wording stays
// non-technical and identifies the merchant as the actor who can fix it.
const FRIENDLY_DISABLED =
  "The diamond browser is not yet enabled for this store. The store owner can enable it from the app settings.";

export async function validateMerchantWidget(req, res, next) {
  try {
    const shop = req.body?.shop || req.query?.shop;
    if (!shop || typeof shop !== "string") {
      return res.status(400).json({ error: "shop is required" });
    }

    if (process.env.NODE_ENV === "development") {
      // Auto-create/upsert the session and merchant row so local database is populated
      // and doesn't break foreign key constraints on CartItem or Order.
      const sessionExist = await prisma.session.findFirst({ where: { shop } });
      if (!sessionExist) {
        await prisma.session.create({
          data: {
            id: `offline_${shop}`,
            shop,
            state: "local_dev",
            isOnline: false,
            accessToken: "local_dev_token",
          },
        });
      }

      await prisma.merchant.upsert({
        where: { shopId: shop },
        update: { widgetEnabled: true },
        create: { shopId: shop, widgetEnabled: true },
      });

      req.shop = shop;
      return next();
    }

    const session = await prisma.session.findFirst({ where: { shop } });
    if (!session) {
      return res.status(403).json({ error: "shop not authorized" });
    }

    // Use upsert (not findFirst + create) to handle concurrent first-request
    // races atomically. Prisma upsert is single-statement; two simultaneous
    // requests for the same shop won't double-insert under contention.
    const merchant = await prisma.merchant.upsert({
      where:  { shopId: shop },
      update: {},
      create: { shopId: shop },
    });

    if (!merchant.widgetEnabled) {
      return res.status(403).json({ error: FRIENDLY_DISABLED });
    }

    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
}

export default validateMerchantWidget;
