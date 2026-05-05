// Owner-shop check (Phase F7).
//
// Owners are identified by Shopify shop domain via a comma-separated
// OWNER_SHOP_DOMAINS env var. Used by:
//   - server/routes/admin.js  → authorize POST /api/admin/billing-flag
//   - app/routes/app.settings.jsx (server-side loader) → decide whether to
//     render the owner-only billing toggle section
//
// Fail-safe default: env var missing or empty → no shops are owners. The
// toggle is invisible to everyone, the admin endpoint rejects everyone.
// We never default to "everyone is an owner" — that would expose the
// billing flip to every merchant on a misconfigured deploy.

export function isOwnerShop(shop) {
  if (!shop || typeof shop !== "string") return false;
  const raw = process.env.OWNER_SHOP_DOMAINS || "";
  const owners = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (owners.length === 0) return false;
  return owners.includes(shop.trim().toLowerCase());
}
