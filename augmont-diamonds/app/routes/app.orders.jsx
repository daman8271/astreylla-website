import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const apiUrl = process.env.EXPRESS_API_URL ?? "http://localhost:4000";
  const authHeader = request.headers.get("Authorization") ?? "";

  try {
    const res = await fetch(`${apiUrl}/api/orders`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) return { orders: [] };
    const data = await res.json();
    return { orders: data.orders ?? [] };
  } catch {
    return { orders: [] };
  }
};

const STATUS_TONES = {
  pending: "caution",
  confirmed: "success",
  shipped: "info",
  cancelled: "critical",
};

export default function OrdersPage() {
  const { orders } = useLoaderData();

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
                <s-table-cell>Customer</s-table-cell>
                <s-table-cell>Items</s-table-cell>
                <s-table-cell>Status</s-table-cell>
                <s-table-cell>Date</s-table-cell>
                <s-table-cell>Augmont Invoice</s-table-cell>
              </s-table-header-row>
            </s-table-header>
            <s-table-body>
              {orders.map((order) => {
                const itemCount = Array.isArray(order.cartItemIds)
                  ? order.cartItemIds.length
                  : (order.diamondId?.split(",").filter(Boolean).length || 1);
                return (
                  <s-table-row key={order.id}>
                    <s-table-cell>{order.id}</s-table-cell>
                    <s-table-cell>
                      {order.customerName
                        ? `${order.customerName} <${order.customerEmail}>`
                        : order.customerEmail}
                    </s-table-cell>
                    <s-table-cell>{itemCount}</s-table-cell>
                    <s-table-cell>
                      <s-badge tone={STATUS_TONES[order.status]}>
                        {order.status}
                      </s-badge>
                    </s-table-cell>
                    <s-table-cell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </s-table-cell>
                    <s-table-cell>
                      {order.augmontInvoiceNumber ?? order.payalOrderId ?? "—"}
                    </s-table-cell>
                  </s-table-row>
                );
              })}
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
