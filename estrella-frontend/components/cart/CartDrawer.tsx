"use client";

import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/shopify";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateLine, removeLine } = useCart();
  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20, 16, 12, 0.4)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 240ms ease",
          zIndex: 70,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          background: "var(--brand-bg, #fbf8f3)",
          boxShadow: "-24px 0 60px rgba(20, 16, 12, 0.18)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0.16, 1)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              letterSpacing: "0.02em",
              color: "var(--brand-text-primary)",
              margin: 0,
            }}
          >
            Cart {itemCount > 0 ? `(${itemCount})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            style={{
              background: "transparent",
              border: 0,
              padding: 8,
              cursor: "pointer",
              color: "var(--brand-text-primary)",
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {lines.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 32px",
                textAlign: "center",
                gap: 16,
              }}
            >
              <ShoppingBag size={40} strokeWidth={1} style={{ opacity: 0.4 }} />
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  color: "var(--brand-text-secondary)",
                }}
              >
                Your cart is empty.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--brand-text-primary)",
                  borderBottom: "1px solid currentColor",
                  paddingBottom: 2,
                }}
              >
                Browse products
              </Link>
            </div>
          ) : (
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
                      gridTemplateColumns: "80px 1fr",
                      gap: 16,
                      padding: "20px 24px",
                      borderBottom:
                        "1px solid var(--brand-border, rgba(0,0,0,0.06))",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: "rgba(0,0,0,0.04)",
                        borderRadius: 4,
                        overflow: "hidden",
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
                        onClick={closeCart}
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          color: "var(--brand-text-primary)",
                          lineHeight: 1.3,
                        }}
                      >
                        {m.product.title}
                      </Link>
                      {variantLabel && (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 12,
                            color: "var(--brand-text-muted)",
                          }}
                        >
                          {variantLabel}
                        </span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            border:
                              "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                            borderRadius: 999,
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
                            <Minus size={14} strokeWidth={1.5} />
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
                            <Plus size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 14,
                            color: "var(--brand-text-primary)",
                          }}
                        >
                          {formatMoney(line.cost.totalAmount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={isLoading}
                        style={{
                          background: "transparent",
                          border: 0,
                          padding: 0,
                          marginTop: 4,
                          alignSelf: "flex-start",
                          fontFamily: "var(--font-sans)",
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--brand-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer
            style={{
              padding: "20px 24px 28px",
              borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
              background: "var(--brand-bg-warm, #f5efe6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--brand-text-secondary)",
              }}
            >
              <span>Subtotal</span>
              <span>{subtotal ? formatMoney(subtotal) : "—"}</span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                color: "var(--brand-text-muted)",
                marginBottom: 16,
              }}
            >
              Taxes and shipping calculated at checkout.
            </p>
            <a
              href={cart?.checkoutUrl}
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 24px",
                background: "var(--brand-text-primary, #1a1208)",
                color: "var(--brand-bg, #fff)",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: 999,
                transition: "opacity 200ms ease",
              }}
            >
              Checkout
            </a>
          </footer>
        )}
      </aside>
    </>
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
