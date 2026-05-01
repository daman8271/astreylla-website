import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  return (
    <s-page heading="Augmont Diamonds">
      <s-banner tone="info" heading="Welcome to Augmont Diamonds">
        Jewellers install this app to let customers browse and order diamonds
        directly from their store. Orders route to Payal&apos;s API automatically.
      </s-banner>

      <s-section heading="Overview">
        <s-stack direction="inline" gap="base">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Total Orders</s-heading>
              <s-text>0</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Active Jewellers</s-heading>
              <s-text>0</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Diamonds Available</s-heading>
              <s-text>0</s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Quick Actions">
        <s-stack direction="inline" gap="base">
          <s-button href="/app/orders">View Orders</s-button>
          <s-button href="/app/diamonds" variant="secondary">
            View Diamonds
          </s-button>
          <s-button href="/app/settings" variant="tertiary">
            Configure Widget
          </s-button>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="App Info">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text>Framework: </s-text>
            <s-text>React Router + Shopify CLI</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text>Hosting: </s-text>
            <s-text>Railway</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text>Database: </s-text>
            <s-text>Supabase (PostgreSQL)</s-text>
          </s-paragraph>
          <s-paragraph>
            <s-text>Status: </s-text>
            <s-badge tone="caution">Phase 2 — In Progress</s-badge>
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
