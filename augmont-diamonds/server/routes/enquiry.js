import { Router } from "express";
import prisma from "../services/prismaClient.js";

// POST /api/public/enquiry — no JWT, public route
export async function handlePublicEnquiry(req, res, next) {
  try {
    const { shop, diamondId, name, email, message, diamondDetails } = req.body;

    if (!shop || !diamondId || !name || !email) {
      return res.status(400).json({ error: "shop, diamondId, name, and email are required" });
    }

    const session = await prisma.session.findUnique({ where: { shop } });
    if (!session) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const order = await prisma.order.create({
      data: {
        shop,
        customerEmail: email,
        diamondId:     String(diamondId),
        diamondDetails: {
          ...(diamondDetails || {}),
          customerName: name,
          message:      message || ""
        },
        status: "pending"
      }
    });

    return res.status(201).json({ success: true, orderId: order.id });
  } catch (err) {
    next(err);
  }
}

const router = Router();
router.post("/", handlePublicEnquiry);
export default router;
