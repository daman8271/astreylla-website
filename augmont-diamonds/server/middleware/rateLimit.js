// Tiny in-memory sliding-window rate limiter.
// Keyed by client IP; one bucket per IP. Single-process only — fine for our
// single Railway service. If we scale to multiple instances, swap for Redis.

const WINDOW_MS = 60 * 1000;
const MAX_HITS  = 60;          // 60 req/min per IP across all rate-limited routes

const buckets = new Map();     // ip -> [ ...timestamps ]

// Periodic prune so we don't leak memory.
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [ip, hits] of buckets) {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) buckets.delete(ip);
    else buckets.set(ip, fresh);
  }
}, WINDOW_MS).unref?.();

function clientIp(req) {
  // CORS + Railway means we trust X-Forwarded-For from the proxy.
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "unknown";
}

export function publicRateLimit(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (buckets.get(ip) || []).filter((t) => t > cutoff);
  hits.push(now);
  buckets.set(ip, hits);

  if (hits.length > MAX_HITS) {
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }
  next();
}
