import { Router } from "express";
import prisma from "../services/prismaClient.js";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_NAME_LEN              = 200;
const MAX_MESSAGE_LEN           = 2000;
const MAX_DIAMOND_ID_LEN        = 200;
const MAX_DIAMOND_DETAILS_BYTES = 10 * 1024;

// POST /api/public/enquiry — public route.
// Shop authorization + widget-enabled check is done upstream in
// validateMerchantWidget (server/index.js wires it at /api/public).
export async function handlePublicEnquiry(req, res, next) {
  try {
    const { shop, diamondId, name, email, message, diamondDetails } = req.body || {};

    if (!diamondId || typeof diamondId !== "string" || diamondId.length > MAX_DIAMOND_ID_LEN) {
      return res.status(400).json({ error: "diamondId is required (≤200 chars)" });
    }
    if (!name || typeof name !== "string" || name.length < 1 || name.length > MAX_NAME_LEN) {
      return res.status(400).json({ error: "name is required (1–200 chars)" });
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "valid email is required" });
    }
    if (message != null && (typeof message !== "string" || message.length > MAX_MESSAGE_LEN)) {
      return res.status(400).json({ error: "message must be a string (≤2000 chars)" });
    }
    if (diamondDetails != null) {
      const detailsJson = JSON.stringify(diamondDetails);
      if (detailsJson.length > MAX_DIAMOND_DETAILS_BYTES) {
        return res.status(400).json({ error: "diamondDetails exceeds 10KB" });
      }
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
