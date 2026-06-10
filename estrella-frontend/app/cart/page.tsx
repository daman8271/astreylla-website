"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/shopify";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, isLoading, updateLine, removeLine } = useCart();
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <div style={{ maxWidth: 1200, margin: "120px auto 80px", padding: "0 24px", minHeight: "60vh" }}>
      {/* Back link */}
      <Link
        href="/diamonds"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--brand-text-secondary, #6b6b6b)",
          textDecoration: "none",
          marginBottom: 32,
          transition: "opacity 150ms ease",
        }}
        className="hover:opacity-75"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Continue Shopping
      </Link>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 400,
          color: "var(--brand-text-primary)",
          marginBottom: 40,
          letterSpacing: "0.01em",
        }}
      >
        Shopping Cart {itemCount > 0 && `(${itemCount})`}
      </h1>

      {lines.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            background: "var(--brand-bg-soft, #f8f6f3)",
            border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
            borderRadius: 8,
            textAlign: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag size={36} strokeWidth={1.2} style={{ color: "var(--brand-text-secondary)" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--brand-text-primary)",
              margin: 0,
            }}
          >
            Your cart is currently empty
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--brand-text-secondary)",
              maxWidth: 400,
              lineHeight: 1.6,
              margin: "0 0 10px",
            }}
          >
            Explore our collection of lab-grown diamonds, bespoke engagement settings, and gemstone jewelry.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link
              href="/diamonds"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                background: "var(--brand-text-primary, #1a1208)",
                color: "var(--brand-bg, #fff)",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                borderRadius: 4,
                textDecoration: "none",
                transition: "opacity 150ms ease",
              }}
              className="hover:opacity-90"
            >
              Browse Diamonds
            </Link>
            <Link
              href="/ring-studio/setting"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                border: "1px solid var(--brand-text-primary, #1a1208)",
                color: "var(--brand-text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                borderRadius: 4,
                textDecoration: "none",
                transition: "opacity 150ms ease",
              }}
              className="hover:opacity-75"
            >
              Ring Studio
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 48,
          }}
          className="cart-grid"
        >
          {/* Main columns: 2 columns on desktop */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "start" }}>
            {/* Left Column: Items */}
            <div style={{ flex: "1 1 700px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "4fr 1fr 1fr 1fr",
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.12))",
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--brand-text-secondary, #6b6b6b)",
                }}
                className="cart-table-head"
              >
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span style={{ textAlign: "right" }}>Total</span>
              </div>

              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {lines.map((line) => {
                  const m = line.merchandise;
                  const variantLabel = m.selectedOptions
                    .filter((o) => o.value !== "Default Title")
                    .map((o) => `${o.name}: ${o.value}`)
                    .join(" · ");
                  return (
                    <li
                      key={line.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "4fr 1fr 1fr 1fr",
                        gap: 16,
                        alignItems: "center",
                        padding: "24px 0",
                        borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                      }}
                      className="cart-table-row"
                    >
                      {/* Product image & title */}
                      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <div
                          style={{
                            width: 96,
                            height: 96,
                            background: "rgba(0,0,0,0.03)",
                            borderRadius: 6,
                            overflow: "hidden",
                            border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                            flexShrink: 0,
                          }}
                        >
                          {m.image?.url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.image.url}
                              alt={m.image.altText ?? m.product.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <Link
                            href={`/products/${m.product.handle}`}
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 16,
                              fontWeight: 500,
                              color: "var(--brand-text-primary)",
                              textDecoration: "none",
                              lineHeight: 1.3,
                            }}
                            className="hover:underline"
                          >
                            {m.product.title}
                          </Link>
                          {variantLabel && (
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: 12,
                                color: "var(--brand-text-secondary)",
                              }}
                            >
                              {variantLabel}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            disabled={isLoading}
                            style={{
                              background: "transparent",
                              border: 0,
                              padding: 0,
                              marginTop: 6,
                              alignSelf: "flex-start",
                              fontFamily: "var(--font-sans)",
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--brand-text-muted, #8c8c8c)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "color 150ms ease",
                            }}
                            className="hover:text-red-600"
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "var(--brand-text-primary)",
                        }}
                      >
                        {formatMoney(m.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.15))",
                          borderRadius: 999,
                          background: "#fff",
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isLoading}
                          onClick={() =>
                            line.quantity <= 1
                              ? removeLine(line.id)
                              : updateLine(line.id, line.quantity - 1)
                          }
                          style={qtyBtn}
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 13,
                            minWidth: 28,
                            textAlign: "center",
                          }}
                        >
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isLoading}
                          onClick={() => updateLine(line.id, line.quantity + 1)}
                          style={qtyBtn}
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>

                      {/* Total */}
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--brand-text-primary)",
                          textAlign: "right",
                        }}
                      >
                        {formatMoney(line.cost.totalAmount)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Column: Summary Panel */}
            <div
              style={{
                flex: "1 1 340px",
                background: "var(--brand-bg-soft, #f8f6f3)",
                border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                borderRadius: 8,
                padding: "32px 28px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 400,
                  color: "var(--brand-text-primary)",
                  borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                  paddingBottom: 16,
                  marginBottom: 24,
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--brand-text-secondary)",
                }}
              >
                <span>Subtotal ({itemCount} items)</span>
                <strong style={{ color: "var(--brand-text-primary)" }}>
                  {subtotal ? formatMoney(subtotal) : "—"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--brand-text-secondary)",
                }}
              >
                <span>Shipping &amp; Taxes</span>
                <span>Calculated at checkout</span>
              </div>

              <a
                href={cart?.checkoutUrl}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "16px 24px",
                  background: "var(--brand-text-primary, #1a1208)",
                  color: "var(--brand-bg, #fff)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  borderRadius: 4,
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "opacity 150ms ease",
                }}
                className="hover:opacity-90"
              >
                Proceed to Checkout
              </a>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--brand-text-muted, #8c8c8c)",
                  textAlign: "center",
                  lineHeight: 1.4,
                  marginTop: 16,
                  marginHorizontal: 0,
                }}
              >
                Secure checkout is processed via Shopify. All prices are inclusive of duties &amp; local VAT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX/CSS for responsiveness */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .cart-table-head {
            display: none !important;
          }
          .cart-table-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            border-bottom: 2px solid var(--brand-border-subtle, rgba(0,0,0,0.08)) !important;
            padding: 24px 0 !important;
          }
          .cart-table-row > div {
            text-align: left !important;
          }
          .cart-table-row > div:last-child {
            text-align: left !important;
            font-size: 16px !important;
            margin-top: 8px !important;
            border-top: 1px dashed var(--brand-border-subtle, rgba(0,0,0,0.06)) !important;
            padding-top: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  background: "transparent",
  border: 0,
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--brand-text-primary)",
};
