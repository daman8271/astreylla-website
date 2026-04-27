// Verifies the Shopify session token on every protected request.
// Token arrives in Authorization: Bearer <token> header.
// Rejects with 401 if missing, expired, or invalid signature.
export async function verifySessionToken(req, res, next) {
  // TODO: extract Bearer token from req.headers.authorization
  // TODO: decode JWT and verify signature using SHOPIFY_API_SECRET
  // TODO: check token expiry (exp claim)
  // TODO: attach decoded shop domain to req.shop for downstream use
  // TODO: call next() if valid, res.status(401).json({ error: "Unauthorized" }) if not
  next(); // placeholder — remove when logic is added
}
