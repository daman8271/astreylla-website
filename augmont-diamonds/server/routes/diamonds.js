import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import prisma from "../services/prismaClient.js";
import { getDiamonds, getDiamondById } from "../services/payalApi.js";

const router = Router();

// GET /api/public/diamonds — no JWT, requires ?shop= query param
// Called directly from the Theme Extension widget in the buyer's browser.
export async function handlePublicDiamonds(req, res, next) {
  try {
    const { shop, ...filters } = req.query;
    if (!shop) {
      return res.status(400).json({ error: "shop query parameter is required" });
    }

    const session = await prisma.session.findUnique({ where: { shop } });
    if (!session) {
      return res.status(403).json({ error: "shop not authorized" });
    }

    const diamonds = await getDiamonds(filters);
    res.json({ diamonds });
  } catch (err) {
    next(err);
  }
}

// GET /api/diamonds — admin (Remix) calls this with a Shopify session token
router.get("/", verifySessionToken, async (req, res, next) => {
  try {
    const diamonds = await getDiamonds(req.query);
    res.json({ diamonds });
  } catch (err) {
    next(err);
  }
});

// GET /api/diamonds/:id
router.get("/:id", verifySessionToken, async (req, res, next) => {
  try {
    const diamond = await getDiamondById(req.params.id);
    res.json({ diamond });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: err.message });
    next(err);
  }
});

export default router;
