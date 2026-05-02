// All communication with Augmont's LGD diamond API lives here.
// Credentials come from .env: PAYAL_API_USERNAME, PAYAL_API_PASSWORD, AUGMONT_BASE_URL.
// Login returns a JWT we cache in-memory; refreshed on expiry or 401.

const BASE_URL = () => (process.env.AUGMONT_BASE_URL || "").replace(/\/$/, "");
const USERNAME = () => process.env.PAYAL_API_USERNAME;
const PASSWORD = () => process.env.PAYAL_API_PASSWORD;

// Refresh ~12h before nominal 7d expiry
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000;

let tokenCache = { token: null, expiresAt: 0 };

function assertConfig() {
  if (!BASE_URL() || !USERNAME() || !PASSWORD()) {
    throw new Error(
      "Augmont config missing — set AUGMONT_BASE_URL, PAYAL_API_USERNAME, PAYAL_API_PASSWORD"
    );
  }
}

// Custom error class so route handlers can map upstream status codes cleanly.
export class AugmontError extends Error {
  constructor(message, { status, code, body } = {}) {
    super(message);
    this.name = "AugmontError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

// POST /merchant/login — returns JWT
async function login() {
  assertConfig();
  const url = `${BASE_URL()}/merchant/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME(), password: PASSWORD() }),
  });

  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }

  if (!res.ok) {
    throw new AugmontError(`Augmont login failed`, { status: res.status, body });
  }

  const token =
    body?.token ||
    body?.data?.token ||
    body?.result?.data?.token ||
    body?.jwt ||
    body?.accessToken;

  if (!token) {
    throw new AugmontError("Augmont login: no token in response", {
      status: 500, body,
    });
  }

  tokenCache = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return token;
}

async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  return login();
}

function buildQs(query) {
  const entries = Object.entries(query || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}

// Authenticated request with one auto-retry on 401 (token refresh).
// Throws AugmontError on non-2xx; returns parsed body on success.
async function authedRequest(method, path, { query, body } = {}) {
  const url = `${BASE_URL()}${path}${buildQs(query)}`;
  const send = async (token) => {
    const init = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    return fetch(url, init);
  };

  let token = await getToken();
  let res = await send(token);

  if (res.status === 401) {
    tokenCache = { token: null, expiresAt: 0 };
    token = await login();
    res = await send(token);
  }

  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { raw: text }; }

  if (!res.ok) {
    let code;
    if (res.status === 403) code = "FEATURE_DISABLED";
    else if (res.status === 404) code = "NOT_FOUND";
    else if (res.status === 400) code = "BAD_REQUEST";
    throw new AugmontError(
      parsed?.message || `Augmont ${method} ${path} failed (${res.status})`,
      { status: res.status, code, body: parsed }
    );
  }
  return parsed;
}

// ─── Diamonds ────────────────────────────────────────────────────────────

function normalizeDiamond(p) {
  if (!p || typeof p !== "object") return null;
  const id = p.id ?? p.stockNum ?? p.productId ?? p.sku;
  if (!id) return null;

  const carat = Number(p.weight ?? p.carat ?? p.size ?? 0) || 0;
  const price = Number(p.finalPrice ?? p.price ?? p.sellPrice ?? p.amount ?? 0) || 0;
  const available =
    p.available ?? p.isAvailable ?? p.inStock ??
    (p.isUnavailable != null ? !p.isUnavailable :
      (p.status ? p.status === "available" : true));

  return {
    id: String(id),
    stockNum:  p.stockNum ?? null,
    shape:     p.shape ?? p.cut ?? "—",
    carat,
    color:     p.color ?? p.colour ?? "—",
    clarity:   p.clarity ?? "—",
    cut:       p.cut ?? null,
    polish:    p.polish ?? null,
    symmetry:  p.symmetry ?? null,
    lab:       p.lab ?? null,
    measurements: p.measurements ?? null,
    pricePerCarat: p.pricePerCarat != null ? Number(p.pricePerCarat) : null,
    price,
    image_url: p.diamondImage ?? p.image_url ?? p.imageUrl ?? p.image ?? "",
    video_url: p.diamondVideo ?? null,
    title:     p.title ?? null,
    available: Boolean(available),
  };
}

// ─── Products cache (stale-while-revalidate over Augmont /merchant/products)
//
// Why: Augmont UAT latency is volatile (60-120s degraded periods observed in
// prod browser smoke May 2, 2026). Without caching, every buyer pageview blocks
// on Augmont — and a slow Augmont call also starves the single Prisma pool
// connection, cascading into 504s on unrelated cart endpoints.
//
// Strategy:
//   - Fixed 10-min TTL (entries refresh on any catalog change Payal makes).
//   - Stale-while-revalidate: stale entries are served instantly, refreshed in
//     background. Buyers never wait on a stale revalidation.
//   - In-flight Promise dedup: thundering-herd-safe on cold miss AND background
//     revalidation.
//   - Skip-empty: never cache an empty array (Augmont returning [] is an
//     anomaly, not a real "no diamonds" state — caching it would lock buyers
//     out for 10 min).
//   - LRU cap at 50 entries. Math: ~50 KB/entry × 50 = 2.5 MB worst case.
//   - 60s back-off when revalidation fails or returns empty.
//   - ?nocache=1 bypass for diagnostics — skips both read AND write.
//
// AUGMONT_CACHE_TTL_MS env override is a tuning knob (also used by smoke
// tests to reproduce the stale-hit path quickly).
const CACHE_TTL_MS = Number(process.env.AUGMONT_CACHE_TTL_MS) || 10 * 60 * 1000;
const CACHE_REVALIDATE_BACKOFF_MS = 60 * 1000;
const CACHE_MAX_ENTRIES = 50;

// Map<key, { data, fetchedAt, expiresAt, inFlight }>
const productsCache = new Map();

function buildCacheKey(filters) {
  if (!filters || typeof filters !== "object") return "";
  // Coerce all values to strings to avoid {minCarat:1} and {minCarat:"1"}
  // landing on different cache keys.
  const entries = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, String(v)])
    .sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return "";
  return new URLSearchParams(entries).toString();
}

function evictOldestIfNeeded() {
  if (productsCache.size < CACHE_MAX_ENTRIES) return;
  let oldestKey = null;
  let oldestAt = Infinity;
  for (const [k, v] of productsCache) {
    // Skip entries still being filled by an initial fetch — they have no
    // fetchedAt yet and shouldn't be evicted before they ever served data.
    if (v.fetchedAt > 0 && v.fetchedAt < oldestAt) {
      oldestAt = v.fetchedAt;
      oldestKey = k;
    }
  }
  if (oldestKey !== null) {
    productsCache.delete(oldestKey);
    console.log(`[cache] evict key=${oldestKey || "<root>"} ageMs=${Date.now() - oldestAt}`);
  }
}

async function fetchAndNormalizeProducts(filters) {
  const body = await authedRequest("GET", "/merchant/products", { query: filters });
  const list =
    body?.data?.products ||
    body?.data ||
    body?.result?.data?.products ||
    body?.result?.data ||
    body?.products ||
    (Array.isArray(body) ? body : []);
  const arr = Array.isArray(list) ? list : [];
  return arr.map(normalizeDiamond).filter(Boolean);
}

export async function getDiamonds(filters = {}, opts = {}) {
  const { nocache = false } = opts;
  const key = buildCacheKey(filters);
  const keyLabel = key || "<root>";

  if (nocache) {
    console.log(`[cache] bypass key=${keyLabel} reason=nocache`);
    return fetchAndNormalizeProducts(filters);
  }

  const now = Date.now();
  const entry = productsCache.get(key);

  // FRESH HIT
  if (entry && entry.data && now < entry.expiresAt) {
    console.log(`[cache] hit key=${keyLabel} ageMs=${now - entry.fetchedAt}`);
    return entry.data;
  }

  // STALE HIT — return stale data, refresh in background (fire-and-forget)
  if (entry && entry.data && now >= entry.expiresAt) {
    console.log(`[cache] stale-hit key=${keyLabel} ageMs=${now - entry.fetchedAt} revalidating`);
    if (!entry.inFlight) {
      entry.inFlight = (async () => {
        const startMs = Date.now();
        try {
          const fresh = await fetchAndNormalizeProducts(filters);
          if (fresh && fresh.length > 0) {
            entry.data = fresh;
            entry.fetchedAt = Date.now();
            entry.expiresAt = entry.fetchedAt + CACHE_TTL_MS;
            console.log(`[cache] revalidate-ok key=${keyLabel} latencyMs=${Date.now() - startMs}`);
          } else {
            // Don't replace stale data with empty; back off briefly.
            entry.expiresAt = Date.now() + CACHE_REVALIDATE_BACKOFF_MS;
            console.log(`[cache] skip-empty key=${keyLabel} (revalidation returned empty; keeping stale data, back-off ${CACHE_REVALIDATE_BACKOFF_MS}ms)`);
          }
        } catch (err) {
          entry.expiresAt = Date.now() + CACHE_REVALIDATE_BACKOFF_MS;
          console.log(`[cache] revalidate-fail key=${keyLabel} error=${err.message}`);
        } finally {
          entry.inFlight = null;
        }
      })();
    }
    return entry.data;
  }

  // DEDUP — concurrent caller saw a placeholder entry being filled by an
  // earlier cold-miss originator. Await the same Promise.
  if (entry && entry.inFlight) {
    console.log(`[cache] dedup key=${keyLabel}`);
    return entry.inFlight;
  }

  // COLD MISS — originator path. Set placeholder so concurrent callers dedup.
  console.log(`[cache] miss key=${keyLabel}`);
  const fetchPromise = fetchAndNormalizeProducts(filters);
  productsCache.set(key, {
    data: null,
    fetchedAt: 0,
    expiresAt: 0,
    inFlight: fetchPromise,
  });

  try {
    const fresh = await fetchPromise;
    if (fresh && fresh.length > 0) {
      evictOldestIfNeeded();
      productsCache.set(key, {
        data: fresh,
        fetchedAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
        inFlight: null,
      });
    } else {
      console.log(`[cache] skip-empty key=${keyLabel} (initial fetch returned empty; not caching)`);
      productsCache.delete(key);
    }
    return fresh;
  } catch (err) {
    productsCache.delete(key);
    throw err;
  }
}

export async function getDiamondById(id) {
  if (!id) throw new AugmontError("diamond id required", { status: 400 });
  const all = await getDiamonds();
  const match = all.find((d) => d.id === String(id));
  if (!match) {
    throw new AugmontError(`Diamond ${id} not found`, { status: 404, code: "NOT_FOUND" });
  }
  return match;
}

// ─── Cart ────────────────────────────────────────────────────────────────

// Flatten an Augmont cart row into something the widget can render.
function normalizeCartLine(line) {
  if (!line || typeof line !== "object") return null;
  const id = line.id ?? line.cartId ?? line.cartItemId;
  if (!id) return null;
  return {
    augmontCartItemId: String(id),
    productId: String(line.productId ?? line.product?.id ?? ""),
    quantity:  Number(line.quantity ?? 1),
    isActive:  Boolean(line.isActive ?? true),
    isOrderPlaced: Boolean(line.isOrderPlace ?? false),
    diamond:   line.product ? normalizeDiamond(line.product) : null,
    raw: line,
  };
}

// POST /merchant/cart/add  body: { cartProducts: [{ productId }] }
// Returns array of newly-created cart lines (one per productId in input).
export async function addToCart(productIds = []) {
  const ids = (Array.isArray(productIds) ? productIds : [productIds])
    .map((x) => String(x).trim())
    .filter(Boolean);
  if (!ids.length) {
    throw new AugmontError("at least one productId required", { status: 400 });
  }
  const body = await authedRequest("POST", "/merchant/cart/add", {
    body: { cartProducts: ids.map((productId) => ({ productId })) },
  });
  const arr = Array.isArray(body?.data) ? body.data : [];
  return arr.map(normalizeCartLine).filter(Boolean);
}

// GET /merchant/cart — returns ALL cart lines for the merchant (shared).
export async function getCart() {
  const body = await authedRequest("GET", "/merchant/cart");
  const arr = Array.isArray(body?.data) ? body.data : [];
  return {
    currency: body?.currencyCode || "USD",
    lines: arr.map(normalizeCartLine).filter(Boolean),
  };
}

// DELETE /merchant/cart/delete/{id}  — id = augmont cart line id
export async function removeFromCart(augmontCartItemId) {
  if (!augmontCartItemId) {
    throw new AugmontError("cart item id required", { status: 400 });
  }
  await authedRequest(
    "DELETE",
    `/merchant/cart/delete/${encodeURIComponent(augmontCartItemId)}`
  );
  return { ok: true };
}

// ─── Orders ──────────────────────────────────────────────────────────────

// POST /merchant/order/create
// Each cartItem entry needs: id (augmont cart line id), productId, plus optional notes.
export async function createOrder(cartItems = [], notes = {}) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AugmontError("cartItems is required", { status: 400 });
  }
  const payload = {
    cartItems: cartItems.map((it) => ({
      id:                    String(it.id),
      productId:             String(it.productId),
      generalNotes:          notes.generalNotes || "",
      customerReference:     notes.customerReference || "",
      orderNote:             notes.orderNote || "",
      defaultQcRequirements: notes.defaultQcRequirements || "",
    })),
  };
  const body = await authedRequest("POST", "/merchant/order/create", { body: payload });
  return {
    invoiceNumber:
      body?.data?.invoiceNumber ?? body?.invoiceNumber ?? body?.data?.invoice_number ?? null,
    orderId:
      body?.data?.orderId ?? body?.orderId ?? body?.data?.id ?? null,
    raw: body,
  };
}

// GET /merchant/order/status?invoiceNumber=N
export async function getOrderStatus(invoiceNumber) {
  if (!invoiceNumber) {
    throw new AugmontError("invoiceNumber required", { status: 400 });
  }
  const body = await authedRequest("GET", "/merchant/order/status", {
    query: { invoiceNumber },
  });
  return body?.data ?? body;
}

// Test helper — exported for diagnostic routes / scripts only.
export async function _debugLogin() {
  return login();
}
