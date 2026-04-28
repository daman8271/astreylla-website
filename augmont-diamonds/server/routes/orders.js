import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import prisma from "../services/prismaClient.js";

const router = Router();

// GET /api/orders
// Returns up to 50 most recent orders for the authenticated shop.
router.get("/", verifySessionToken, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { shop: req.shop },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
// Customer submits a diamond order from the storefront widget.
// Saves order to Postgres, then forwards it to Payal's API.
router.post("/", verifySessionToken, async (req, res, next) => {
  // TODO: validate req.body (shop, customerEmail, diamondId, diamondDetails)
  // TODO: save order to DB via prisma (status: "pending")
  // TODO: call payalApi.createOrder(orderData)
  // TODO: update order in DB with payalOrderId + status: "confirmed"
  // TODO: return created order as JSON
});

export default router;
