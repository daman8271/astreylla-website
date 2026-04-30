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

export async function getDiamonds(filters = {}) {
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
