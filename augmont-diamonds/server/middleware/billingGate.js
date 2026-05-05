// Phase F7 — gate around billing routes.
//
// Reads the global "billing_enabled" flag from app_config and either:
//   - flag=true   → next() (proceed with normal billing flow)
//   - flag=false
//     OR row missing
//     OR DB read error → respond 200 with a friendly note and DO NOT
//                        call next() (short-circuit; nothing downstream
//                        runs, including any real Shopify billing call).
//
// Why fail-closed-but-200: the gate is meant to keep the app free until
// the owner deliberately flips the flag. A 5xx on flag-read would let
// Shopify retry billing webhooks indefinitely while the merchant sees
// errors; returning 200 with billingEnabled:false is the correct "no-op,
// stop retrying" answer.
//
// Module-level cache (10s TTL) avoids hammering Postgres on every webhook
// — Shopify retries can fan out hard. invalidateBillingFlagCache() is
// called by the admin update endpoint immediately after a write so the
// new value takes effect within the next request rather than waiting
// for the cache to expire.

import prisma from "../services/prismaClient.js";

const CACHE_TTL_MS = 10_000;

let cache = { value: null, fetchedAt: 0 };

export function invalidateBillingFlagCache() {
  cache = { value: null, fetchedAt: 0 };
  console.log("[billingGate] cache invalidated");
}

async function readFlag() {
  const now = Date.now();
  if (cache.value !== null && now - cache.fetchedAt < CACHE_TTL_MS) {
    console.log(`[billingGate] cache hit value=${cache.value} ageMs=${now - cache.fetchedAt}`);
    return cache.value;
  }
  try {
    const row = await prisma.appConfig.findUnique({ where: { key: "billing_enabled" } });
    const value = row?.value === "true";
    cache = { value, fetchedAt: Date.now() };
    console.log(`[billingGate] cache miss → db value=${value}`);
    return value;
  } catch (err) {
    // Fail-closed: treat read error as flag=false. The widget/cart paths
    // are unaffected because this middleware is only mounted on /webhooks/billing
    // (and any future /api/billing/* routes) — read failure here cannot
    // block the diamond catalog or order-create flow.
    console.warn(`[billingGate] db read failed, treating as disabled: ${err.message}`);
    return false;
  }
}

export async function billingGate(req, res, next) {
  const enabled = await readFlag();
  if (enabled) {
    return next();
  }
  return res.status(200).json({
    ok: true,
    billingEnabled: false,
    note: "Billing currently disabled — app is free.",
  });
}
