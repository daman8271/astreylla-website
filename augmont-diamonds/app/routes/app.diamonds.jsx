import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const SHOW_MOCK = true;

const MOCK_DIAMONDS = [
  {
    id: "DIA-4521",
    shape: "Round",
    carat: "1.02",
    color: "F",
    clarity: "VS1",
    price: "₹1,85,000",
  },
  {
    id: "DIA-3310",
    shape: "Princess",
    carat: "0.75",
    color: "G",
    clarity: "SI1",
    price: "₹98,500",
  },
  {
    id: "DIA-6072",
    shape: "Oval",
    carat: "1.50",
    color: "E",
    clarity: "VVS2",
    price: "₹3,20,000",
  },
];

export default function DiamondsPage() {
  const diamonds = SHOW_MOCK ? MOCK_DIAMONDS : [];

  return (
    <s-page heading="Diamond Catalog">
      <s-button slot="primary-action" variant="secondary">
        Refresh
      </s-button>

      <s-section heading="Available Diamonds">
        {diamonds.length === 0 ? (
          <s-box
            padding="loose"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="base">
              <s-heading>No diamonds found</s-heading>
              <s-paragraph>
                Connect Payal API to see diamonds. Add your API key in{" "}
                <s-link href="/app/settings">Settings</s-link>.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : (
          <s-table>
            <s-table-header>
              <s-table-header-row>
                <s-table-cell>ID</s-table-cell>
                <s-table-cell>Shape</s-table-cell>
                <s-table-cell>Carat</s-table-cell>
                <s-table-cell>Color</s-table-cell>
                <s-table-cell>Clarity</s-table-cell>
                <s-table-cell>Price</s-table-cell>
              </s-table-header-row>
            </s-table-header>
            <s-table-body>
              {diamonds.map((diamond) => (
                <s-table-row key={diamond.id}>
                  <s-table-cell>{diamond.id}</s-table-cell>
                  <s-table-cell>{diamond.shape}</s-table-cell>
                  <s-table-cell>{diamond.carat}</s-table-cell>
                  <s-table-cell>{diamond.color}</s-table-cell>
                  <s-table-cell>{diamond.clarity}</s-table-cell>
                  <s-table-cell>{diamond.price}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      <s-section slot="aside" heading="About the Catalog">
        <s-paragraph>
          Diamond data is fetched live from Payal's API. Set your API key in{" "}
          <s-link href="/app/settings">Settings</s-link> to connect.
        </s-paragraph>
        <s-paragraph>
          Jeweller's customers see this catalog on the storefront via the
          Diamond Widget theme extension.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
