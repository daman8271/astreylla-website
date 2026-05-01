import { createHmac, timingSafeEqual } from "crypto";

// Send a customer data report back to Shopify (required by GDPR data_request webhook)
export async function sendDataReport(shop, _accessToken, _reportPayload) {
  // No identifying customer data stored beyond order email (by operational necessity).
  // Placeholder for future implementation if we begin storing additional PII.
  console.log(`[shopifyApi] data report requested for shop=${shop}`);
}

// Verify a Shopify webhook HMAC signature.
// rawBody must be the raw Buffer (before JSON parsing) — use req.rawBody.
// hmacHeader is the value of X-Shopify-Hmac-SHA256 (base64 string).
export function verifyWebhookHmac(rawBody, hmacHeader) {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !rawBody || !hmacHeader) return false;

  const generated = createHmac("sha256", secret).update(rawBody).digest("base64");

  // Compare the base64 strings as UTF-8 byte buffers to avoid timing attacks.
  const a = Buffer.from(hmacHeader);
  const b = Buffer.from(generated);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
