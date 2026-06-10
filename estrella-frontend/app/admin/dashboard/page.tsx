"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  shop: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  settingDetails: {
    sku: string;
    name: string;
    metal: string;
    size: string;
    price: number;
  } | null;
  cardDetails: {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  } | null;
  totalAmount: number | null;
  diamondId: string;
  diamondDetails: any[];
  status: string;
  shopifyOrderId: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/widget/api/admin/orders-list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError((err as Error).message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/widget/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert((err as Error).message || "Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  // Metrics
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "active").length;
  const completedOrders = orders.filter((o) => o.status === "confirmed" || o.status === "completed" || o.status === "ordered").length;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf9f6" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--brand-text-secondary)" }}>Loading Dashboard Data…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", marginTop: 40, background: "#fcfaf7", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, borderBottom: "1px solid #e5dfd5", paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: 30, fontWeight: 400, color: "var(--brand-text-primary, #1a1a1a)", margin: 0 }}>
              Order Management Portal
            </h1>
            <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 13, color: "var(--brand-text-secondary, #6b6b6b)", margin: "4px 0 0 0" }}>
              Track bespoke ring studio checkout purchases
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 18px",
              background: "transparent",
              border: "1px solid #dcd6cd",
              borderRadius: 6,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--brand-text-primary)",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            Sign Out
          </button>
        </header>

        {error && (
          <div style={{ background: "#fdf2f2", border: "1px solid #f8b4b4", borderRadius: 6, padding: "16px", color: "#9b2c2c", fontFamily: "var(--font-sans)", fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Metrics Bar */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 56 }}>
          <div style={metricCardStyle}>
            <span style={metricLabelStyle}>Total Orders</span>
            <strong style={metricValueStyle}>{totalOrders}</strong>
          </div>
          <div style={metricCardStyle}>
            <span style={metricLabelStyle}>Total Revenue</span>
            <strong style={metricValueStyle}>${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div style={metricCardStyle}>
            <span style={metricLabelStyle}>Pending Actions</span>
            <strong style={{ ...metricValueStyle, color: "#b45309" }}>{pendingOrders}</strong>
          </div>
          <div style={metricCardStyle}>
            <span style={metricLabelStyle}>Confirmed / Completed</span>
            <strong style={{ ...metricValueStyle, color: "#15803d" }}>{completedOrders}</strong>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "3fr 2fr" : "1fr", gap: 24, alignItems: "start", marginTop: 16 }}>

          {/* Left Column: Orders List */}
          <div style={{ background: "#ffffff", border: "1px solid #e5dfd5", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f2ede4" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--brand-text-primary)", margin: 0 }}>
                Bespoke Orders Summary
              </h2>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "var(--brand-text-secondary)" }}>
                No bespoke orders have been placed yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#fbf9f6", borderBottom: "1px solid #e5dfd5" }}>
                      <th style={thStyle}>Order ID</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Customer</th>
                      <th style={thStyle}>Ring Configuration</th>
                      <th style={thStyle}>Total Amount</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const diamondItem = order.diamondDetails?.[0] || {};

                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            borderBottom: "1px solid #f2ede4",
                            cursor: "pointer",
                            background: isSelected ? "#f9f6f0" : "transparent",
                            transition: "background 100ms ease",
                          }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 600 }}>#{order.id.slice(-6).toUpperCase()}</td>
                          <td style={tdStyle}>{dateStr}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{order.customerName || "—"}</div>
                            <div style={{ fontSize: 11, color: "#6b6b6b", marginTop: 2 }}>{order.customerEmail}</div>
                            {order.customerPhone && (
                              <div style={{ fontSize: 11, color: "#8a8a8a", marginTop: 2 }}>{order.customerPhone}</div>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 500 }}>
                              {order.settingDetails?.name || "Bespoke Ring"}
                            </div>
                            <div style={{ fontSize: 11, color: "#6b6b6b", marginTop: 2 }}>
                              SKU: {order.settingDetails?.sku || "—"} · Diamond: {diamondItem.carat ? `${diamondItem.carat}ct ${diamondItem.shape}` : "Loose Diamond"}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            ${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                fontSize: 12,
                                borderRadius: 4,
                                border: "1px solid #dcd6cd",
                                background: "#fff",
                                color: getStatusColor(order.status).text,
                                borderColor: getStatusColor(order.status).bg,
                                cursor: "pointer",
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="ordered">Ordered</option>
                              <option value="shipped">Shipped</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Inspector */}
          {selectedOrder && (
            <div style={{ background: "#ffffff", border: "1px solid #e5dfd5", borderRadius: 8, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.01)", position: "sticky", top: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f2ede4", paddingBottom: 12 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--brand-text-primary)", margin: 0 }}>
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "transparent",
                    border: 0,
                    fontSize: 16,
                    cursor: "pointer",
                    color: "var(--brand-text-secondary)"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Order ID & Date */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Reference</span>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selectedOrder.id}</div>
                <div style={{ fontSize: 12, color: "#8a8a8a", marginTop: 2 }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>

              {/* Customer details */}
              <div style={inspectorSectionStyle}>
                <h4 style={inspectorSubheadingStyle}>Customer Info</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <span style={metaLabelStyle}>Name</span>
                    <div style={metaValueStyle}>{selectedOrder.customerName || "—"}</div>
                  </div>
                  <div>
                    <span style={metaLabelStyle}>Phone</span>
                    <div style={metaValueStyle}>{selectedOrder.customerPhone || "—"}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={metaLabelStyle}>Email</span>
                  <div style={metaValueStyle}>{selectedOrder.customerEmail}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={metaLabelStyle}>Shipping Address</span>
                  <div style={{ ...metaValueStyle, lineHeight: 1.4 }}>{selectedOrder.shippingAddress || "—"}</div>
                </div>
              </div>

              {/* Setting details */}
              {selectedOrder.settingDetails && (
                <div style={inspectorSectionStyle}>
                  <h4 style={inspectorSubheadingStyle}>Ring Setting Details</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={metaLabelStyle}>Name</span>
                      <div style={metaValueStyle}>{selectedOrder.settingDetails.name}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>SKU</span>
                      <div style={metaValueStyle}>{selectedOrder.settingDetails.sku}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Metal / Color</span>
                      <div style={metaValueStyle}>{selectedOrder.settingDetails.metal}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Ring Size</span>
                      <div style={metaValueStyle}>Size {selectedOrder.settingDetails.size}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Diamond details */}
              {selectedOrder.diamondDetails?.[0] && (
                <div style={inspectorSectionStyle}>
                  <h4 style={inspectorSubheadingStyle}>Diamond Specification</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={metaLabelStyle}>Shape / Carat</span>
                      <div style={metaValueStyle}>{selectedOrder.diamondDetails[0].shape} · {Number(selectedOrder.diamondDetails[0].carat).toFixed(2)}ct</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Color / Clarity</span>
                      <div style={metaValueStyle}>{selectedOrder.diamondDetails[0].color} · {selectedOrder.diamondDetails[0].clarity}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Lab / Cert No</span>
                      <div style={metaValueStyle}>{selectedOrder.diamondDetails[0].lab || "IGI"} · {selectedOrder.diamondDetails[0].certNum || "—"}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Stock Number</span>
                      <div style={metaValueStyle}>{selectedOrder.diamondDetails[0].stockNum || selectedOrder.diamondId}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Details (Mocked) */}
              {selectedOrder.cardDetails && (
                <div style={{ ...inspectorSectionStyle, background: "#f8f9fc", borderColor: "#e2e8f0" }}>
                  <h4 style={{ ...inspectorSubheadingStyle, color: "#2d3748" }}>Mock Payment Details</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={metaLabelStyle}>Cardholder Name</span>
                      <div style={metaValueStyle}>{selectedOrder.cardDetails.cardholderName}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Card Number</span>
                      <div style={metaValueStyle}>
                        •••• •••• •••• {selectedOrder.cardDetails.cardNumber.slice(-4)}
                      </div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>Expiry Date</span>
                      <div style={metaValueStyle}>{selectedOrder.cardDetails.expiry}</div>
                    </div>
                    <div>
                      <span style={metaLabelStyle}>CVV Code</span>
                      <div style={metaValueStyle}>•••</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing breakdown */}
              <div style={{ marginTop: 20, borderTop: "1px solid #f2ede4", paddingTop: 16 }}>
                {selectedOrder.settingDetails && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6b6b6b" }}>
                    <span>Setting Cost</span>
                    <span>${selectedOrder.settingDetails.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {selectedOrder.diamondDetails?.[0] && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6b6b6b" }}>
                    <span>Diamond Cost</span>
                    <span>${(selectedOrder.diamondDetails[0].price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f2ede4", paddingTop: 12, marginTop: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Total Sale Value</span>
                  <strong style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                    ${(selectedOrder.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Styles
const metricCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5dfd5",
  borderRadius: 8,
  padding: "20px 24px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.01)"
};

const metricLabelStyle = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--brand-text-secondary, #6b6b6b)",
  textTransform: "uppercase" as "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6
};

const metricValueStyle = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 24,
  fontWeight: 700,
  color: "var(--brand-text-primary, #1a1a1a)"
};

const thStyle = {
  padding: "14px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--brand-text-secondary)",
  textTransform: "uppercase" as "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle = {
  padding: "16px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--brand-text-primary)",
};

const inspectorSectionStyle = {
  background: "#faf9f6",
  border: "1px solid #f2ede4",
  borderRadius: 6,
  padding: 16,
  marginBottom: 16
};

const inspectorSubheadingStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--brand-text-secondary)",
  textTransform: "uppercase" as "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 12px 0",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  paddingBottom: 6
};

const metaLabelStyle = {
  display: "block",
  fontSize: 11,
  color: "#8a8a8a",
  marginBottom: 2
};

const metaValueStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#2d2d2d"
};

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return { text: "#b45309", bg: "#fef3c7" };
    case "confirmed":
      return { text: "#15803d", bg: "#dcfce7" };
    case "ordered":
      return { text: "#1d4ed8", bg: "#dbeafe" };
    case "shipped":
      return { text: "#6b21a8", bg: "#f3e8ff" };
    case "cancelled":
      return { text: "#9b2c2c", bg: "#fde8e8" };
    default:
      return { text: "#4a5568", bg: "#edf2f7" };
  }
}
