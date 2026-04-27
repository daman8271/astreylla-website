// GraphQL calls to Shopify Admin API.
// Used by the Express server when it needs to read/write Shopify data.

// Send a customer data report back to Shopify (required by GDPR data_request webhook)
export async function sendDataReport(shop, accessToken, reportPayload) {
  // TODO: POST to https://${shop}/admin/api/2024-01/graphql.json
  // TODO: use customerDataErasureReport mutation
  // TODO: pass accessToken in X-Shopify-Access-Token header
}

// Verify a Shopify webhook HMAC signature
export function verifyWebhookHmac(rawBody, hmacHeader) {
  // TODO: compute HMAC-SHA256 of rawBody using SHOPIFY_API_SECRET
  // TODO: compare with hmacHeader using timing-safe comparison
  // TODO: return true / false
}
