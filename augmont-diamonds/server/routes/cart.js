import { Router } from "express";
import prisma from "../services/prismaClient.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  createOrder,
  getDiamondById,
  AugmontError,
} from "../services/payalApi.js";

const router = Router();

const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const MAX_CUSTOMER_NAME_LEN = 200;
const MAX_ORDER_NOTE_LEN    = 2000;

// Augmont cart line IDs are UUIDs; reject anything else as a hardening step.
function isLikelyUuid(s) {
  return typeof s === "string" && UUID_RE.test(s);
}

function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 8 || sessionId.length > 64) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(sessionId);
}

function userFacingError(err) {
  if (err instanceof AugmontError) {
    // P2: upstream timeout — map BEFORE status checks (code is the contract,
    // status is informational on UPSTREAM_TIMEOUT).
    if (err.code === "UPSTREAM_TIMEOUT") {
      return {
        status: 503,
        body: { error: "Your cart is temporarily unavailable. Please try again in a moment." },
      };
    }
    if (err.status === 403) {
      return { status: 503, body: { error: "Cart feature is not yet enabled. Please contact the store." } };
    }
    if (err.status === 404) return { status: 404, body: { error: err.message } };
    if (err.status === 400) return { status: 400, body: { error: err.message } };
  }
  return null;
}

// Shop authorization + widget-enabled gate is done upstream in
// validateMerchantWidget (server/index.js wires it at /api/public). The
// handlers here can trust that req.body.shop / req.query.shop is a valid,
// widget-enabled installed shop with a Merchant row guaranteed to exist.

// POST /api/public/cart/add
// Body: { shop, sessionId, productId }
router.post("/add", async (req, res, next) => {
  try {
    const { shop, sessionId, productId } = req.body || {};
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "valid sessionId is required" });
    }
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ error: "productId is required" });
    }

    // Idempotency: if this session already has this diamond active, return existing.
    const existing = await prisma.cartItem.findFirst({
      where: { shop, sessionId, diamondId: productId, status: "active" },
    });
    if (existing) {
      // Include the cached diamond snapshot so the widget can update its
      // pill / mini-cart without a follow-up GET /api/public/cart round-trip.
      return res.json({
        success: true,
        cartItemId: existing.id,
        augmontCartItemId: existing.augmontCartItemId,
        alreadyInCart: true,
        diamond: existing.diamondDetails || null,
      });
    }

    // Fetch a fresh diamond snapshot for our DB record.
    let diamondDetails;
    try {
      diamondDetails = await getDiamondById(productId);
    } catch (err) {
      if (err instanceof AugmontError && err.status === 404) {
        return res.status(404).json({ error: "Diamond not found" });
      }
      throw err;
    }

    const added = await addToCart([productId]);
    const line = added[0];
    if (!line || !line.augmontCartItemId) {
      return res.status(502).json({ error: "Augmont did not return a cart line" });
    }

    // If the DB insert fails, roll the Augmont add back so we don't leak.
    let item;
    try {
      item = await prisma.cartItem.create({
        data: {
          shop,
          sessionId,
          augmontCartItemId: line.augmontCartItemId,
          diamondId: productId,
          diamondDetails,
          status: "active",
        },
      });
    } catch (dbErr) {
      try { await removeFromCart(line.augmontCartItemId); } catch { /* best effort */ }
      throw dbErr;
    }

    // Include the diamond snapshot we just persisted so the widget can
    // update its pill / mini-cart immediately. Without this, widgets
    // re-fetch GET /api/public/cart after every add — a second Augmont
    // round-trip via getCart() that's the bulk of perceived "add to cart"
    // latency. Returning the snapshot makes that follow-up optional.
    res.json({
      success: true,
      cartItemId: item.id,
      augmontCartItemId: item.augmontCartItemId,
      alreadyInCart: false,
      diamond: diamondDetails,
    });
  } catch (err) {
    const mapped = userFacingError(err);
    if (mapped) return res.status(mapped.status).json(mapped.body);
    next(err);
  }
});

// GET /api/public/cart?shop=X&sessionId=Y
router.get("/", async (req, res, next) => {
  try {
    const { shop, sessionId } = req.query;
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "valid sessionId is required" });
    }

    const ours = await prisma.cartItem.findMany({
      where: { shop, sessionId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    if (ours.length === 0) {
      return res.json({ items: [], currency: "USD", count: 0, total: 0 });
    }

    let augmont;
    try {
      augmont = await getCart();
    } catch (err) {
      const mapped = userFacingError(err);
      if (mapped) return res.status(mapped.status).json(mapped.body);
      throw err;
    }

    const augmontById = new Map();
    for (const line of augmont.lines) augmontById.set(line.augmontCartItemId, line);

    const items = [];
    const staleIds = [];
    for (const c of ours) {
      const live = augmontById.get(c.augmontCartItemId);
      if (!live) {
        staleIds.push(c.id);
        continue;
      }
      items.push({
        id: c.id,
        augmontCartItemId: c.augmontCartItemId,
        diamondId: c.diamondId,
        diamond: live.diamond || c.diamondDetails,
        addedAt: c.createdAt,
      });
    }

    if (staleIds.length) {
      await prisma.cartItem.updateMany({
        where: { id: { in: staleIds } },
        data: { status: "stale" },
      });
    }

    const total = items.reduce(
      (sum, i) => sum + Number(i.diamond?.price || 0),
      0
    );
    res.json({
      items,
      currency: augmont.currency,
      count: items.length,
      total: Math.round(total * 100) / 100,
    });
  } catch (err) {
    const mapped = userFacingError(err);
    if (mapped) return res.status(mapped.status).json(mapped.body);
    next(err);
  }
});

// DELETE /api/public/cart/:id?shop=X&sessionId=Y
// :id = our cart_items.id (NOT augmont cart line id) — privacy + ownership safety
router.delete("/:id", async (req, res, next) => {
  try {
    const { shop, sessionId } = req.query;
    const { id } = req.params;
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "valid sessionId is required" });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, shop, sessionId, status: "active" },
    });
    if (!item) return res.status(404).json({ error: "Cart item not found" });

    if (item.augmontCartItemId && isLikelyUuid(item.augmontCartItemId)) {
      try {
        await removeFromCart(item.augmontCartItemId);
      } catch (err) {
        // 404 from Augmont = already gone; treat as success
        if (!(err instanceof AugmontError && err.status === 404)) {
          const mapped = userFacingError(err);
          if (mapped) return res.status(mapped.status).json(mapped.body);
          throw err;
        }
      }
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { status: "removed" },
    });

    res.json({ success: true });
  } catch (err) {
    const mapped = userFacingError(err);
    if (mapped) return res.status(mapped.status).json(mapped.body);
    next(err);
  }
});

// POST /api/public/order/create
// Body: { shop, sessionId, customerEmail, customerName, customerPhone, shippingAddress, settingDetails, cardDetails, totalAmount, orderNote }
// Exported separately so server/index.js can mount it at the spec path.
export async function handlePublicOrderCreate(req, res, next) {
  try {
    const { shop, sessionId, customerEmail, customerName, customerPhone, shippingAddress, settingDetails, cardDetails, totalAmount, orderNote } = req.body || {};
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "valid sessionId is required" });
    }
    if (!customerEmail || typeof customerEmail !== "string" || !EMAIL_RE.test(customerEmail)) {
      return res.status(400).json({ error: "valid customerEmail is required" });
    }
    if (
      !customerName ||
      typeof customerName !== "string" ||
      customerName.length < 1 ||
      customerName.length > MAX_CUSTOMER_NAME_LEN
    ) {
      return res.status(400).json({ error: "customerName is required (1–200 chars)" });
    }
    if (
      orderNote != null &&
      (typeof orderNote !== "string" || orderNote.length > MAX_ORDER_NOTE_LEN)
    ) {
      return res.status(400).json({ error: "orderNote must be a string (≤2000 chars)" });
    }

    const items = await prisma.cartItem.findMany({
      where: { shop, sessionId, status: "active" },
    });
    if (!items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cartItemsForAugmont = items
      .filter((i) => i.augmontCartItemId)
      .map((i) => ({ id: i.augmontCartItemId, productId: i.diamondId }));

    // For bespoke Ring Studio orders (identified by settingDetails in body),
    // skip the Augmont order API entirely — these are tracked in our own DB.
    // For regular diamond orders with Augmont cart items, attempt Augmont API
    // but always fall back to saving as "pending" on any failure.
    let augmontResult = null;
    let orderStatus = "pending";
    const isBespokeOrder = !!(settingDetails && settingDetails.sku);

    if (!isBespokeOrder && cartItemsForAugmont.length > 0) {
      try {
        augmontResult = await createOrder(cartItemsForAugmont, {
          orderNote: orderNote || "",
          customerReference: customerEmail,
        });
        orderStatus = "confirmed";
      } catch (err) {
        if (err instanceof AugmontError) {
          // Any Augmont error (400, 403, timeout) → save as pending for admin review
          console.warn(`[order/create] Augmont error (status=${err.status}), saving as pending: ${err.body?.message || err.message}`);
        } else {
          throw err;
        }
      }
    } else if (isBespokeOrder) {
      console.log(`[order/create] Bespoke ring order — skipping Augmont, saving directly as pending`);
    }

    const order = await prisma.order.create({
      data: {
        shop,
        customerEmail,
        customerName,
        customerPhone: customerPhone || null,
        shippingAddress: shippingAddress || null,
        settingDetails: settingDetails || null,
        cardDetails: cardDetails || null,
        totalAmount: totalAmount ? Number(totalAmount) : null,
        diamondId: items.map((i) => i.diamondId).join(","),
        diamondDetails: items.map((i) => i.diamondDetails),
        cartItemIds: items.map((i) => i.id),
        orderNote: orderNote || null,
        augmontInvoiceNumber: augmontResult?.invoiceNumber ? String(augmontResult.invoiceNumber) : null,
        augmontOrderId: augmontResult?.orderId ? String(augmontResult.orderId) : null,
        status: orderStatus,
      },
    });

    await prisma.cartItem.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { status: "ordered" },
    });

    res.status(201).json({
      success: true,
      orderId: order.id,
      invoiceNumber: order.augmontInvoiceNumber,
      itemCount: items.length,
    });
  } catch (err) {
    const mapped = userFacingError(err);
    if (mapped) return res.status(mapped.status).json(mapped.body);
    next(err);
  }
}

export default router;
