import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";

// Initialized once at module load. Requires SHOPIFY_API_KEY + SHOPIFY_API_SECRET in env.
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: (process.env.SHOPIFY_SCOPES || "read_products,write_orders").split(","),
  hostName: process.env.HOST || "localhost",
  isEmbeddedApp: true,
  apiVersion: ApiVersion.April26,
});

// Verifies the Shopify session token on every protected API request.
// Token arrives as: Authorization: Bearer <jwt>
// Attaches req.shop (e.g. "mystore.myshopify.com") on success.
export async function verifySessionToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    // decodeSessionToken verifies HS256 signature with SHOPIFY_API_SECRET,
    // checks exp claim, and validates iss/dest structure.
    const payload = await shopify.session.decodeSessionToken(token);
    req.shop = new URL(payload.dest).hostname;
    next();
  } catch (err) {
    console.warn("[auth] invalid session token:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
