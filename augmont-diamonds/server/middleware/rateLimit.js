// Tiny in-memory sliding-window rate limiters. Single-process — fine for our
// single Railway instance. If we scale to multiple instances, swap for Redis.
//
// Two limiters share the same factory:
//   - per-IP   (60 req/min) — defends against single-source flooders
//   - per-shop (120 req/min) — caps total cross-IP traffic targeting one
//     merchant. Higher headroom than per-IP because a busy storefront with
//     several concurrent customers browsing 12+ diamonds can legitimately
//     generate 60+ req/min from one shop without any abuse.

const WINDOW_MS     = 60 * 1000;
const PER_IP_HITS   = 60;
const PER_SHOP_HITS = 120;

function clientIp(req) {
  // CORS + Railway means we trust X-Forwarded-For from the proxy.
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function shopKey(req) {
  const shop = req.body?.shop || req.query?.shop;
  return typeof shop === "string" && shop.length ? shop : null;
}

// Builds a sliding-window limiter keyed by whatever keyFn returns. If keyFn
// returns null for a request, the limiter passes through (lets downstream
// validation return the proper 4xx instead of swallowing it as 429).
function makeSlidingWindowLimiter(keyFn, maxHits) {
  const buckets = new Map();   // key -> [...timestamps]

  // Periodic prune so we don't leak memory.
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS;
    for (const [k, hits] of buckets) {
      const fresh = hits.filter((t) => t > cutoff);
      if (fresh.length === 0) buckets.delete(k);
      else buckets.set(k, fresh);
    }
  }, WINDOW_MS).unref?.();

  return function rateLimitMiddleware(req, res, next) {
    const key = keyFn(req);
    if (!key) return next();
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    const hits = (buckets.get(key) || []).filter((t) => t > cutoff);
    hits.push(now);
    buckets.set(key, hits);

    if (hits.length > maxHits) {
      res.set("Retry-After", "60");
      return res.status(429).json({
        error: "Too many requests. Please slow down.",
      });
    }
    next();
  };
}

export const publicRateLimit         = makeSlidingWindowLimiter(clientIp, PER_IP_HITS);
export const publicRateLimitPerShop  = makeSlidingWindowLimiter(shopKey, PER_SHOP_HITS);
