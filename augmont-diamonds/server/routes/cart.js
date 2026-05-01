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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Augmont cart line IDs are UUIDs; reject anything else as a hardening step.
function isLikelyUuid(s) {
  return typeof s === "string" && UUID_RE.test(s);
}

// All public cart routes require shop + sessionId. Centralize the validation.
// Also lazily provisions a Merchant row — the cart_items and orders FKs both
// reference merchants.shopId, and merchant records aren't created during OAuth.
async function validateShop(shop) {
  if (!shop || typeof shop !== "string") {
    return { ok: false, status: 400, error: "shop is required" };
  }
  // findFirst (not findUnique) — Session.shop is no longer @unique post-C2.
  const session = await prisma.session.findFirst({ where: { shop } });
  if (!session) return { ok: false, status: 403, error: "shop not authorized" };
  await prisma.merchant.upsert({
    where:  { shopId: shop },
    update: {},
    create: { shopId: shop },
  });
  return { ok: true };
}

function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 8 || sessionId.length > 64) {
    return false;
  }
  return /^[A-Za-z0-9_-]+$/.test(sessionId);
}

function userFacingError(err) {
  if (err instanceof AugmontError) {
    if (err.status === 403) {
      return { status: 503, body: { error: "Cart feature is not yet enabled. Please contact the store." } };
    }
    if (err.status === 404) return { status: 404, body: { error: err.message } };
    if (err.status === 400) return { status: 400, body: { error: err.message } };
  }
  return null;
}

// POST /api/public/cart/add
// Body: { shop, sessionId, productId }
router.post("/add", async (req, res, next) => {
  try {
    const { shop, sessionId, productId } = req.body || {};
    const v = await validateShop(shop);
    if (!v.ok) return res.status(v.status).json({ error: v.error });
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
      return res.json({
        success: true,
        cartItemId: existing.id,
        augmontCartItemId: existing.augmontCartItemId,
        alreadyInCart: true,
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

    res.json({
      success: true,
      cartItemId: item.id,
      augmontCartItemId: item.augmontCartItemId,
      alreadyInCart: false,
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
    const v = await validateShop(shop);
    if (!v.ok) return res.status(v.status).json({ error: v.error });
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
    const v = await validateShop(shop);
    if (!v.ok) return res.status(v.status).json({ error: v.error });
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
// Body: { shop, sessionId, customerEmail, customerName, orderNote }
// Exported separately so server/index.js can mount it at the spec path.
export async function handlePublicOrderCreate(req, res, next) {
  try {
    const { shop, sessionId, customerEmail, customerName, orderNote } = req.body || {};
    const v = await validateShop(shop);
    if (!v.ok) return res.status(v.status).json({ error: v.error });
    if (!validateSessionId(sessionId)) {
      return res.status(400).json({ error: "valid sessionId is required" });
    }
    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: "customerEmail and customerName are required" });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "invalid email" });
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

    let result;
    try {
      result = await createOrder(cartItemsForAugmont, {
        orderNote: orderNote || "",
        customerReference: customerEmail,
      });
    } catch (err) {
      if (err instanceof AugmontError) {
        if (err.status === 403) {
          return res.status(503).json({
            error: "Online checkout is not yet enabled. Please contact the store to complete your order.",
          });
        }
        if (err.status === 400) {
          return res.status(400).json({
            error: err.body?.message || "Order rejected by Augmont. A default delivery address may be missing.",
          });
        }
      }
      throw err;
    }

    const order = await prisma.order.create({
      data: {
        shop,
        customerEmail,
        customerName,
        diamondId: items.map((i) => i.diamondId).join(","),
        diamondDetails: items.map((i) => i.diamondDetails),
        cartItemIds: items.map((i) => i.id),
        orderNote: orderNote || null,
        augmontInvoiceNumber: result.invoiceNumber ? String(result.invoiceNumber) : null,
        augmontOrderId: result.orderId ? String(result.orderId) : null,
        status: "confirmed",
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
