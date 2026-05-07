import { Router } from "express";
import { verifySessionToken } from "../middleware/auth.js";
import { getDiamonds, getDiamondById, AugmontError } from "../services/payalApi.js";

const router = Router();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 24;

function badPagination(res, message) {
  return res.status(400).json({ error: message, code: "INVALID_PAGINATION" });
}

// Per-page comparator factory for the four sort modes the widget exposes.
// Field names match the normalized diamond shape from payalApi.js
// (price: number, carat: number). Unknown sort values fall back to null
// (caller skips the sort step).
function sortComparator(sort) {
  switch (sort) {
    case "price_asc":
      return (a, b) => (Number(a?.price) || 0) - (Number(b?.price) || 0);
    case "price_desc":
      return (a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0);
    case "carat_asc":
      return (a, b) => (Number(a?.carat) || 0) - (Number(b?.carat) || 0);
    case "carat_desc":
      return (a, b) => (Number(b?.carat) || 0) - (Number(a?.carat) || 0);
    default:
      return null;
  }
}

// Map widget-side treatment values to Augmont's exact strings (verified
// C-iter2: ?treatment=CVD returns ~268K stones, ?treatment=Natural returns
// ~13). Anything else passes through unchanged so future Augmont values
// don't require a code change.
function mapTreatment(value) {
  if (!value) return null;
  if (value === "lab-grown") return "CVD";
  if (value === "natural") return "Natural";
  return value;
}

// Certificate filter: "Other" means "any cert that isn't GIA / IGI / HRD".
// Augmont has no "not in" predicate, so the server fetches without the
// certificate filter (or with the explicit picks only) and post-filters
// the page to keep only stones whose lab is in the explicit picks OR not
// in the well-known three. The trade-off (per-page filtering) is the
// same one accepted for sort: counts stay accurate but the visible page
// may have fewer than `pageSize` stones if the page intersects sparsely.
const KNOWN_CERTS = new Set(["GIA", "IGI", "HRD"]);
function partitionCertFilter(certParam) {
  if (!certParam) return { upstream: null, otherSelected: false, picks: [] };
  const tokens = String(certParam)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const otherSelected = tokens.some((t) => /^other$/i.test(t));
  const explicitPicks = tokens.filter((t) => !/^other$/i.test(t));
  if (otherSelected) {
    // Cannot push "Other" upstream — Augmont only knows literal cert
    // names. We fetch unfiltered (or with explicit picks if mixing
    // wouldn't shrink the result inappropriately) and post-filter.
    return { upstream: null, otherSelected: true, picks: explicitPicks };
  }
  return {
    upstream: explicitPicks.length ? explicitPicks.join(",") : null,
    otherSelected: false,
    picks: explicitPicks,
  };
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

    // Pull `sort`, `treatment`, `certificate`, and the price-range params
    // out of the upstream filter set: each needs server-side handling.
    //   sort        — ignored upstream, sorted server-side per page
    //   treatment   — mapped to Augmont's exact string
    //   certificate — "Other" tag means a server-side post-filter
    //   minFinalPrice / maxFinalPrice — D-iter10: Augmont's price filter
    //     contract is unverified (params may be silently ignored, accepted,
    //     or rejected with 400). To avoid the 400 risk we DO NOT forward
    //     them upstream; we only post-filter the page after fetch. Same
    //     trade-off as cert "Other": page may show < pageSize stones if
    //     many fall outside the chosen price range.
    const {
      sort: sortParam,
      treatment: treatmentParam,
      certificate: certParam,
      minFinalPrice: minPriceParam,
      maxFinalPrice: maxPriceParam,
      ...rest
    } = filters;

    const augmontFilters = { ...rest };
    const mappedTreatment = mapTreatment(treatmentParam);
    if (mappedTreatment) augmontFilters.treatment = mappedTreatment;

    const certInfo = partitionCertFilter(certParam);
    if (certInfo.upstream) augmontFilters.certificate = certInfo.upstream;

    // Coerce price bounds; ignore invalid/empty values so a stray empty
    // string from the widget doesn't filter out every stone.
    const minPriceNum =
      minPriceParam !== undefined && minPriceParam !== ""
        ? Number(minPriceParam)
        : null;
    const maxPriceNum =
      maxPriceParam !== undefined && maxPriceParam !== ""
        ? Number(maxPriceParam)
        : null;
    const wantPriceFilter =
      (minPriceNum !== null && Number.isFinite(minPriceNum)) ||
      (maxPriceNum !== null && Number.isFinite(maxPriceNum));

    const augmontQuery = { ...augmontFilters, from: fromNum, to: toNum };
    if (wantCount) augmontQuery.count = "true";

    const result = await getDiamonds(augmontQuery, {
      nocache: nocache === "1",
    });
    // CRITICAL: clone the cached array before any in-place mutation. The
    // cache stores `result` by reference; `Array.prototype.sort` mutates,
    // and `.filter` returns a new array but if we ever skip the cert step
    // the same reference is forwarded. A previous request issuing
    // `?sort=price_desc` would otherwise leave the cached page sorted, so a
    // subsequent unsorted request returns price-desc order. Always slice.
    let diamonds = Array.isArray(result.diamonds) ? result.diamonds.slice() : [];
    const totalCount = result.totalCount;

    // Certificate "Other" post-filter (C-iter2). Reduce the page to stones
    // whose lab is NOT one of the well-known certs OR is in the explicit
    // picks the user mixed with "Other". When only "Other" is selected
    // and no explicit picks, this collapses to "lab not in {GIA,IGI,HRD}".
    if (certInfo.otherSelected) {
      const explicitSet = new Set(certInfo.picks);
      diamonds = diamonds.filter((d) => {
        const lab = String(d?.lab || "").toUpperCase();
        if (explicitSet.has(lab)) return true;
        return !KNOWN_CERTS.has(lab);
      });
    }

    // Price post-filter (D-iter10). Augmont's price-filter contract is
    // unverified, so the price slider's bounds are enforced server-side
    // here regardless of whether Augmont applied them. Same per-page
    // trade-off as the cert post-filter above.
    if (wantPriceFilter) {
      diamonds = diamonds.filter((d) => {
        const px = Number(d?.price);
        if (!Number.isFinite(px)) return false;
        if (minPriceNum !== null && px < minPriceNum) return false;
        if (maxPriceNum !== null && px > maxPriceNum) return false;
        return true;
      });
    }

    // Server-side sort fallback (C-iter1 task 1.2). We sort only the page
    // we just fetched (24 stones), not the full catalog — true catalog
    // sort would require Augmont support, which doesn't exist today.
    // Trade-off: with paged catalog of 700K stones, "Price: low to high"
    // means "lowest-priced of THIS page is first", not "globally lowest
    // first". Acceptable starting point; document for future review.
    // Safe to sort in place: `diamonds` is now an owned slice (not a cache
    // alias) thanks to the clone above.
    if (sortParam) {
      const cmp = sortComparator(sortParam);
      if (cmp) diamonds.sort(cmp);
    }

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

    // Speculative prefetch of next page (best-effort). When the buyer just
    // landed on the first page (from=1) and there appears to be more, fire
    // a background fetch for the next page so "Load more" lands in the SWR
    // cache. Only first-page → page 2 to avoid runaway prefetch chains.
    // Errors are swallowed (we already responded to the user).
    const shouldPrefetch =
      fromNum === 1 && (hasMore || exposedTotal == null) && nocache !== "1";
    if (shouldPrefetch) {
      const nextFrom = toNum + 1;
      const nextTo = nextFrom + pageSize - 1;
      const prefetchQuery = { ...augmontFilters, from: nextFrom, to: nextTo };
      // Drop count for prefetch — we already have the total from this call,
      // and dropping it keeps the prefetch on the same upstream cache key
      // family as a future user request (which probably also won't ask for
      // count on page 2).
      setImmediate(() => {
        getDiamonds(prefetchQuery).catch(() => {
          /* prefetch failures are non-fatal; the user already has page 1 */
        });
      });
    }
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
