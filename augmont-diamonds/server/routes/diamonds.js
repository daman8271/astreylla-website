import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import { getDiamonds, getDiamondById, AugmontError } from "../services/payalApi.js";

const router = Router();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 24;

function badPagination(res, message) {
  return res.status(400).json({ error: message, code: "INVALID_PAGINATION" });
}

// GET /api/public/diamonds — no JWT, requires ?shop= query param.
// Called directly from the Theme Extension widget in the buyer's browser.
// Shop authorization + widget-enabled check is done upstream in
// validateMerchantWidget (server/index.js wires it at /api/public).
//
// Pagination (Phase F5, contract confirmed by Ravi May 4 2026):
//   ?from=N&to=M  — 1-indexed, inclusive both ends. Defaults: from=1,
//                   to=from+23 (24-stone first page).
//   ?count=true   — adds catalog total in response.totalCount.
//   Page size (to - from + 1) capped at 50.
//
// ?nocache=1 bypasses the in-memory products cache (diagnostic only — does
// not pollute the cache with a possibly-different request).
export async function handlePublicDiamonds(req, res, next) {
  try {
    // Strip shop + nocache + pagination params from filters before forwarding
    // to Augmont as catalog filters — pagination/count are forwarded
    // separately under known keys.
    const {
      shop: _shop,
      nocache,
      from: fromRaw,
      to: toRaw,
      count: countRaw,
      ...filters
    } = req.query;

    const fromProvided = fromRaw !== undefined && fromRaw !== "";
    const toProvided = toRaw !== undefined && toRaw !== "";
    const fromNum = fromProvided ? Number(fromRaw) : 1;
    if (!Number.isInteger(fromNum) || fromNum < 1) {
      return badPagination(res, "from must be a positive integer >= 1");
    }
    const toNum = toProvided ? Number(toRaw) : fromNum + (DEFAULT_PAGE_SIZE - 1);
    if (!Number.isInteger(toNum) || toNum < fromNum) {
      return badPagination(res, "to must be an integer >= from");
    }
    const pageSize = toNum - fromNum + 1;
    if (pageSize > MAX_PAGE_SIZE) {
      return badPagination(
        res,
        `page size (to - from + 1 = ${pageSize}) must be <= ${MAX_PAGE_SIZE}`
      );
    }
    const wantCount = countRaw === "true";

    const augmontQuery = { ...filters, from: fromNum, to: toNum };
    if (wantCount) augmontQuery.count = "true";

    const { diamonds, totalCount } = await getDiamonds(augmontQuery, {
      nocache: nocache === "1",
    });

    // Per spec: only surface totalCount on requests that asked for it. The
    // cache may be holding a totalCount from a prior count=true call under
    // the same filters+page, but echoing it on a count=false request would
    // be inconsistent with the contract.
    const exposedTotal = wantCount ? totalCount : null;
    const hasMore =
      exposedTotal != null
        ? toNum < exposedTotal
        : diamonds.length === pageSize;

    res.json({
      diamonds,
      pagination: { from: fromNum, to: toNum, hasMore },
      totalCount: exposedTotal,
    });
  } catch (err) {
    if (err instanceof AugmontError && err.code === "UPSTREAM_TIMEOUT") {
      return res.status(503).json({
        error: "The diamond catalog is temporarily unavailable. Please try again in a moment.",
      });
    }
    next(err);
  }
}

// GET /api/diamonds — admin (Remix) calls this with a Shopify session token
router.get("/", verifySessionToken, async (req, res, next) => {
  try {
    const { diamonds } = await getDiamonds(req.query);
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
