import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";

const router = Router();

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
