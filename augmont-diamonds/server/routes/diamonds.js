import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import { getDiamonds, getDiamondById } from "../services/payalApi.js";

const router = Router();

// GET /api/public/diamonds — no JWT, requires ?shop= query param.
// Called directly from the Theme Extension widget in the buyer's browser.
// Shop authorization + widget-enabled check is done upstream in
// validateMerchantWidget (server/index.js wires it at /api/public).
//
// ?nocache=1 bypasses the in-memory products cache (diagnostic only — does
// not pollute the cache with a possibly-different request).
export async function handlePublicDiamonds(req, res, next) {
  try {
    // Strip shop + nocache from filters before forwarding to Augmont — they
    // are not catalog filters: shop is the auth context (validated upstream),
    // nocache is a cache directive consumed here.
    const { shop: _shop, nocache, ...filters } = req.query;
    const diamonds = await getDiamonds(filters, { nocache: nocache === "1" });
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
