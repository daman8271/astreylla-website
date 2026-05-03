import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

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
  return { widgetEnabled: merchant.widgetEnabled, apiConnected };
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
  const { widgetEnabled: initial, apiConnected } = useLoaderData();
  const fetcher = useFetcher();
  const [enabled, setEnabled] = useState(initial);

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
