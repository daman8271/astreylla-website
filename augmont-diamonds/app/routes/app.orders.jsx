import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const STATUS_TONES = {
  pending: "caution",
  confirmed: "success",
  shipped: "info",
  cancelled: "critical",
};

const MOCK_ORDERS = [
  {
    id: "ORD-001",
    customerEmail: "raj.jewellers@example.com",
    diamondId: "DIA-4521",
    status: "confirmed",
    date: "2026-04-25",
    payalOrderId: "PAY-89201",
  },
  {
    id: "ORD-002",
    customerEmail: "mehta.gems@example.com",
    diamondId: "DIA-3310",
    status: "pending",
    date: "2026-04-27",
    payalOrderId: "—",
  },
  {
    id: "ORD-003",
    customerEmail: "suresh.diamonds@example.com",
    diamondId: "DIA-6072",
    status: "shipped",
    date: "2026-04-20",
    payalOrderId: "PAY-88944",
  },
];

export default function OrdersPage() {
  const orders = MOCK_ORDERS;

  return (
    <s-page heading="Orders">
      <s-section heading="All Orders">
        {orders.length === 0 ? (
          <s-box
            padding="loose"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="base">
              <s-heading>No orders yet</s-heading>
              <s-paragraph>
                Orders will appear here once jewellers start receiving diamond
                purchases from customers.
              </s-paragraph>
            </s-stack>
          </s-box>
        ) : (
          <s-table>
            <s-table-header>
              <s-table-header-row>
                <s-table-cell>Order ID</s-table-cell>
                <s-table-cell>Customer Email</s-table-cell>
                <s-table-cell>Diamond ID</s-table-cell>
                <s-table-cell>Status</s-table-cell>
                <s-table-cell>Date</s-table-cell>
                <s-table-cell>Payal Order ID</s-table-cell>
              </s-table-header-row>
            </s-table-header>
            <s-table-body>
              {orders.map((order) => (
                <s-table-row key={order.id}>
                  <s-table-cell>{order.id}</s-table-cell>
                  <s-table-cell>{order.customerEmail}</s-table-cell>
                  <s-table-cell>{order.diamondId}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={STATUS_TONES[order.status]}>
                      {order.status}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>{order.date}</s-table-cell>
                  <s-table-cell>{order.payalOrderId}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
