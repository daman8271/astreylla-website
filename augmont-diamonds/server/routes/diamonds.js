import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";

const router = Router();

// GET /api/diamonds
// Fetch full diamond catalog from Payal's API and return to caller.
// Called by: Remix admin UI + Theme Extension widget directly.
router.get("/", verifySessionToken, async (req, res, next) => {
  // TODO: call payalApi.getDiamonds() with filters from req.query
  // TODO: return diamond list as JSON
});

// GET /api/diamonds/:id
// Fetch a single diamond's full details by ID from Payal's API.
// Called by: Theme Extension widget product page.
router.get("/:id", verifySessionToken, async (req, res, next) => {
  // TODO: call payalApi.getDiamondById(req.params.id)
  // TODO: return diamond object as JSON
});

export default router;
