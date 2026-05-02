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

export default router;
