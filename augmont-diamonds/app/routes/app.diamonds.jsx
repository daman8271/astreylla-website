import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

// Loader hits the same /api/public/diamonds endpoint the storefront widget
// uses — same P1 cache + P2 timeout benefits. We pass the merchant's own
// shop so validateMerchantWidget passes the auth check; the widget-enabled
// gate may still 403 if the merchant hasn't toggled it on yet — handled
// below as state="widget-disabled".
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const apiUrl = process.env.EXPRESS_API_URL ?? "http://localhost:4000";
  const url = `${apiUrl}/api/public/diamonds?shop=${encodeURIComponent(session.shop)}`;

  try {
    const res = await fetch(url);
    if (res.status === 403) {
      return { diamonds: [], state: "widget-disabled" };
    }
    if (res.status === 503) {
      return { diamonds: [], state: "upstream-unavailable" };
    }
    if (!res.ok) {
      return { diamonds: [], state: "error" };
    }
    const data = await res.json();
    return { diamonds: data.diamonds ?? [], state: "ok" };
  } catch {
    return { diamonds: [], state: "fetch-failed" };
  }
};

const PRICE_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPrice(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return PRICE_FMT.format(n);
}

function formatCarat(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export default function DiamondsPage() {
  const { diamonds, state } = useLoaderData();

  return (
    <s-page heading="Diamond Catalog">
      <s-section heading="Available Diamonds">
        {state === "widget-disabled" ? (
          <s-box padding="loose" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>Widget not enabled</s-heading>
              <s-paragraph>
                Turn on the Diamond Widget in{" "}
                <s-link href="/app/settings">Settings</s-link> to preview your
                catalog here.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : state === "upstream-unavailable" ? (
          <s-box padding="loose" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>Catalog temporarily unavailable</s-heading>
              <s-paragraph>
                Augmont&apos;s diamond service is responding slowly right now.
                Try again in a moment.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : state !== "ok" ? (
          <s-box padding="loose" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>Unable to load diamonds</s-heading>
              <s-paragraph>
                Couldn&apos;t reach the catalog service. Refresh the page or
                check the API status in{" "}
                <s-link href="/app/settings">Settings</s-link>.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : diamonds.length === 0 ? (
          <s-box padding="loose" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>No diamonds available</s-heading>
              <s-paragraph>
                Augmont returned an empty catalog. New stones from your supplier
                will appear here automatically.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : (
          <s-table>
            <s-table-header>
              <s-table-header-row>
                <s-table-cell>Stock #</s-table-cell>
                <s-table-cell>Shape</s-table-cell>
                <s-table-cell>Carat</s-table-cell>
                <s-table-cell>Color</s-table-cell>
                <s-table-cell>Clarity</s-table-cell>
                <s-table-cell>Price</s-table-cell>
                <s-table-cell>Status</s-table-cell>
              </s-table-header-row>
            </s-table-header>
            <s-table-body>
              {diamonds.map((d) => (
                <s-table-row key={d.id}>
                  <s-table-cell>{d.stockNum ?? d.id}</s-table-cell>
                  <s-table-cell>{d.shape ?? "—"}</s-table-cell>
                  <s-table-cell>{formatCarat(d.carat)}</s-table-cell>
                  <s-table-cell>{d.color ?? "—"}</s-table-cell>
                  <s-table-cell>{d.clarity ?? "—"}</s-table-cell>
                  <s-table-cell>{formatPrice(d.price)}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={d.available ? "success" : "warning"}>
                      {d.available ? "Available" : "Unavailable"}
                    </s-badge>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      <s-section slot="aside" heading="About the Catalog">
        <s-paragraph>
          Diamond data is fetched live from Augmont via your merchant
          credentials. Connection status is shown on the{" "}
          <s-link href="/app/settings">Settings</s-link> page.
        </s-paragraph>
        <s-paragraph>
          Customers see this same catalog on the storefront via the Diamond
          Widget theme extension.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
