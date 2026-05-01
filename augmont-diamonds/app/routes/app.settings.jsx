import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function SettingsPage() {
  return (
    <s-page heading="Settings">
      <s-button slot="primary-action">Save</s-button>

      <s-section heading="Widget Settings">
        <s-stack direction="block" gap="base">
          <s-switch label="Enable Diamond Widget" checked />

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
          <s-password-field
            label="Payal API Key"
            placeholder="Enter your Payal API key"
          />

          <s-stack direction="inline" gap="tight">
            <s-text>API Status:</s-text>
            <s-badge tone="warning">Not Connected</s-badge>
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
