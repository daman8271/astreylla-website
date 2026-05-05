// Phase F7 — billing routes scaffolding.
//
// All routes here are gated by billingGate. With the global flag OFF
// (default state, app is free) the gate short-circuits with
// 200 { ok: true, billingEnabled: false } before any handler below runs,
// so these handlers are placeholders today and only matter once Payal
// flips the flag via the owner-only toggle on the Settings page.
//
// When real billing is wired up later, the actual Shopify Billing API
// charge-create / webhook-verification logic goes inside these handlers.
// The gate stays as-is — it's the kill switch.

import { Router } from "express";
import { billingGate } from "../middleware/billingGate.js";

const router = Router();

// Apply gate to every route on this router. Order matters: gate before
// any business logic so a flag-OFF state never executes a real charge.
router.use(billingGate);

// POST /webhooks/billing — Shopify billing webhook (subscription updates,
// charge approvals, etc.). Stub for F7; real handler arrives when Payal
// flips the toggle and we wire Shopify Billing API integration.
router.post("/", (req, res) => {
  res.status(200).json({
    ok: true,
    billingEnabled: true,
    note: "Billing webhook stub — real handler pending.",
  });
});

export default router;
