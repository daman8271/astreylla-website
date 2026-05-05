import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { isOwnerShop } from "../../server/services/owners.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  // Lazy-create the Merchant row so the Settings page works on a fresh
  // install. OAuth doesn't create Merchants — only this loader and the
  // Express-side validateMerchantWidget middleware do. Default
  // widgetEnabled=false comes from the schema, which means a brand-new
  // install is correctly gated until the merchant flips this toggle.
  const merchant = await db.merchant.upsert({
    where:  { shopId: session.shop },
    update: {},
    create: { shopId: session.shop },
  });
  // Augmont API "connected" = both credentials present and non-empty.
  // We do NOT make a live Augmont call here — Augmont UAT can hang
  // 60-120s during degraded periods, and admins shouldn't experience
  // that on every Settings page load. A future "Test Connection" button
  // can perform the live probe on demand.
  const apiConnected = Boolean(
    process.env.PAYAL_API_USERNAME && process.env.PAYAL_API_PASSWORD
  );

  // Phase F7: surface the owner-only billing toggle. Non-owner shops get
  // billingSection=null which keeps the section out of the rendered tree
  // entirely (no DOM, no hidden controls, no leaked state).
  let billingSection = null;
  if (isOwnerShop(session.shop)) {
    const row = await db.appConfig.findUnique({
      where: { key: "billing_enabled" },
    });
    billingSection = { billingEnabled: row?.value === "true" };
  }

  return {
    widgetEnabled: merchant.widgetEnabled,
    apiConnected,
    billingSection,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const widgetEnabled = formData.get("widgetEnabled") === "true";
  const merchant = await db.merchant.upsert({
    where:  { shopId: session.shop },
    update: { widgetEnabled },
    create: { shopId: session.shop, widgetEnabled },
  });
  return { ok: true, widgetEnabled: merchant.widgetEnabled };
};

export default function SettingsPage() {
  const { widgetEnabled: initial, apiConnected, billingSection } = useLoaderData();
  const fetcher = useFetcher();
  const [enabled, setEnabled] = useState(initial);

  // Phase F7: owner-only billing flag state. Local-only (the loader
  // delivered the initial value); writes go to the Express endpoint
  // /api/admin/billing-flag with an App Bridge session token.
  const [billingEnabled, setBillingEnabled] = useState(
    billingSection ? billingSection.billingEnabled : false
  );
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState(null);

  // Reflect the server's confirmed value back into local state once the
  // action returns (handles concurrent edits and any normalization).
  useEffect(() => {
    if (fetcher.data && typeof fetcher.data.widgetEnabled === "boolean") {
      setEnabled(fetcher.data.widgetEnabled);
    }
  }, [fetcher.data]);

  const handleSwitchChange = (event) => {
    // Polaris s-switch fires either a native change event with
    // event.target.checked or a CustomEvent with detail.checked.
    // Fall back to a plain toggle if neither is present.
    const next =
      typeof event?.target?.checked === "boolean" ? event.target.checked
      : typeof event?.detail?.checked === "boolean" ? event.detail.checked
      : !enabled;
    setEnabled(next);
  };

  const handleSave = () => {
    fetcher.submit(
      { widgetEnabled: String(enabled) },
      { method: "post" }
    );
  };

  // Phase F7: writes go directly to the Express endpoint with a fresh
  // App Bridge session token. We don't proxy through a Remix action
  // because the gate is Express-side and the token already authenticates
  // the shop — running it through Remix's authenticate.admin would just
  // round-trip the same auth the Express middleware already does.
  const handleBillingToggle = async (event) => {
    if (!billingSection) return;
    const next =
      typeof event?.target?.checked === "boolean" ? event.target.checked
      : typeof event?.detail?.checked === "boolean" ? event.detail.checked
      : !billingEnabled;
    setBillingBusy(true);
    setBillingError(null);
    try {
      // window.shopify is exposed by AppProvider (App Bridge). idToken()
      // returns a fresh JWT signed with SHOPIFY_API_SECRET that the
      // server-side verifySessionToken middleware validates.
      const token = await window.shopify.idToken();
      const res = await fetch("/api/admin/billing-flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const body = await res.json();
      setBillingEnabled(Boolean(body.billingEnabled));
    } catch (err) {
      setBillingError(err.message || "Failed to update billing flag");
    } finally {
      setBillingBusy(false);
    }
  };

  const isSaving = fetcher.state === "submitting";

  return (
    <s-page heading="Settings">
      <s-button
        slot="primary-action"
        onClick={handleSave}
        disabled={isSaving || undefined}
      >
        {isSaving ? "Saving…" : "Save"}
      </s-button>

      <s-section heading="Widget Settings">
        <s-stack direction="block" gap="base">
          <s-switch
            label="Enable Diamond Widget"
            checked={enabled || undefined}
            onChange={handleSwitchChange}
          />

          {/* Placeholder controls — not yet persisted. Phase E. */}
          <s-number-field
            label="Diamonds Per Page"
            value="12"
            min="1"
            max="100"
          />

          <s-color-field label="Primary Color" value="#008060" />
        </s-stack>
      </s-section>

      <s-section heading="API Configuration">
        <s-stack direction="block" gap="base">
          {/* Placeholder — not yet persisted. Phase E. */}
          <s-password-field
            label="Payal API Key"
            placeholder="Enter your Payal API key"
          />

          <s-stack direction="inline" gap="tight">
            <s-text>API Status:</s-text>
            <s-badge tone={apiConnected ? "success" : "critical"}>
              {apiConnected ? "Connected" : "Not Connected"}
            </s-badge>
          </s-stack>
        </s-stack>
      </s-section>

      {billingSection ? (
        <s-section heading="Billing (Owner Only)">
          <s-stack direction="block" gap="base">
            <s-switch
              label="Billing enabled (charges merchants)"
              checked={billingEnabled || undefined}
              disabled={billingBusy || undefined}
              onChange={handleBillingToggle}
            />
            {billingBusy ? <s-text>Updating…</s-text> : null}
            {billingError ? (
              <s-banner tone="critical">{billingError}</s-banner>
            ) : null}
            <s-paragraph>
              Off (default): app is free for all merchants. On: future Shopify
              Billing API charges become active. Visible only to owner shops
              configured via OWNER_SHOP_DOMAINS.
            </s-paragraph>
          </s-stack>
        </s-section>
      ) : null}

      <s-section slot="aside" heading="Help">
        <s-paragraph>
          The Diamond Widget displays your catalog on the jeweller&apos;s storefront.
          Toggle it off to hide the widget without uninstalling the app.
        </s-paragraph>
        <s-paragraph>
          Get your Payal API key from Payal&apos;s supplier portal. Without it,
          diamond data and order routing won&apos;t work.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
