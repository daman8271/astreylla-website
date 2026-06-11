"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/shopify";
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const {
    cart,
    dbCartItems,
    dbCartTotal,
    isLoading,
    updateLine,
    removeLine,
    removeDbLine,
    refresh
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const shopifyCount = cart?.totalQuantity ?? 0;
  const dbCount = dbCartItems.length;
  const itemCount = shopifyCount + dbCount;

  // Subtotal calculation
  const shopifySubtotal = Number(cart?.cost.subtotalAmount.amount || 0);
  const totalSubtotal = shopifySubtotal + dbCartTotal;
  const totalSubtotalFormatted = formatMoney({
    amount: String(totalSubtotal),
    currencyCode: cart?.cost.subtotalAmount.currencyCode || "USD"
  });

  const hasDbItems = dbCartItems.length > 0;
  const noItems = lines.length === 0 && dbCartItems.length === 0;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.address || !formData.cardNumber) {
      setCheckoutError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setCheckoutError("");

    const shop = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "trial-shop-sqxnl71f.myshopify.com";
    const sessionId = window.localStorage.getItem("estrella_session_id") || "";

    const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`;
    const cardDetails = {
      cardholderName: formData.cardName || formData.name,
      cardNumber: formData.cardNumber.replace(/\s+/g, ""),
      expiry: formData.cardExpiry,
      cvv: formData.cardCvv
    };

    try {
      const res = await fetch(`/api/widget/api/public/order/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          sessionId,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          shippingAddress,
          cardDetails,
          totalAmount: dbCartTotal,
          orderNote: `Direct Checkout for ${dbCartItems.map(item => item.diamond.stockNum).join(', ')}`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Order placement failed");
      }

      const data = await res.json();
      setOrderConfirmed(data.order);
      // Refresh the cart context so the items count clears
      await refresh();
      window.dispatchEvent(new CustomEvent("estrella-cart-changed"));
    } catch (err) {
      setCheckoutError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div style={{ maxWidth: 640, margin: "140px auto 80px", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", color: "#16a34a", marginBottom: 24 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, color: "var(--brand-text-primary)", marginBottom: 16 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--brand-text-secondary)", marginBottom: 8 }}>
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--brand-text-muted)", marginBottom: 32 }}>
          Order ID: <strong style={{ color: "var(--brand-text-primary)" }}>#{orderConfirmed.id}</strong>
        </p>
        <div style={{ background: "var(--brand-bg-soft, #f8f6f3)", border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))", borderRadius: 8, padding: 24, textAlign: "left", marginBottom: 32 }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 16, marginBottom: 16 }}>Delivery Address</h3>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--brand-text-secondary)", margin: 0 }}>
            {orderConfirmed.shippingAddress || "N/A"}
          </p>
        </div>
        <Link
          href="/diamonds"
          style={{
            display: "inline-block",
            padding: "16px 32px",
            background: "var(--brand-text-primary, #1a1208)",
            color: "var(--brand-bg, #fff)",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

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

      {noItems ? (
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "start" }}>
            {/* Left Column: Items and Checkout Form */}
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
                {/* Shopify lines */}
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
                      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <div
                          style={{
                            width: 96,
                            height: 96,
                            background: "#fff",
                            borderRadius: 6,
                            overflow: "hidden",
                            border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
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

                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "var(--brand-text-primary)",
                        }}
                      >
                        {formatMoney(m.price)}
                      </div>

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

                {/* Database Loose Diamonds */}
                {dbCartItems.map((item) => {
                  const d = item.diamond;
                  const isFancy = !!d.fancyColor;
                  const title = isFancy
                    ? `${d.carat}ct ${d.shape} Fancy ${d.fancyColorIntensity || ""} ${d.fancyColor} Diamond`
                    : `${d.carat}ct ${d.shape} Diamond (Color ${d.color}, Clarity ${d.clarity})`;
                  const subtitle = `Stock #: ${d.stockNum} · Cut: ${d.cut || "—"} · Polish: ${d.polish || "—"} · Symmetry: ${d.symmetry || "—"}`;
                  const imgUrl = `/api/diamond-image/${d.stockNum}`;

                  const formattedPrice = formatMoney({
                    amount: String(d.price),
                    currencyCode: cart?.cost.subtotalAmount.currencyCode || "USD"
                  });

                  return (
                    <li
                      key={item.id}
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
                      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <div
                          style={{
                            width: 96,
                            height: 96,
                            background: "#fff",
                            borderRadius: 6,
                            overflow: "hidden",
                            border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 8
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/favicon.ico";
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <h3
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 16,
                              fontWeight: 500,
                              color: "var(--brand-text-primary)",
                              lineHeight: 1.3,
                              margin: 0
                            }}
                          >
                            {title}
                          </h3>
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: 12,
                              color: "var(--brand-text-secondary)",
                            }}
                          >
                            {subtitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDbLine(item.id)}
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

                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "var(--brand-text-primary)",
                        }}
                      >
                        {formattedPrice}
                      </div>

                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "var(--brand-text-primary)",
                          paddingLeft: 12
                        }}
                      >
                        1
                      </div>

                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--brand-text-primary)",
                          textAlign: "right",
                        }}
                      >
                        {formattedPrice}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {showCheckout && (
                <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 48, borderTop: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.1))", paddingTop: 40 }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 16 }}>1. Contact Information</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 16 }}>2. Shipping Address</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
                      <div style={{ gridColumn: "span 3" }}>
                        <label style={labelStyle}>Street Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>City *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>State / Province *</label>
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>ZIP / Postal Code *</label>
                        <input
                          type="text"
                          required
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, marginBottom: 16 }}>3. Secure Payment Details</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
                      <div style={{ gridColumn: "span 3" }}>
                        <label style={labelStyle}>Name on Card *</label>
                        <input
                          type="text"
                          required
                          value={formData.cardName}
                          onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ gridColumn: "span 3" }}>
                        <label style={labelStyle}>Card Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="•••• •••• •••• ••••"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>Expiry Date (MM/YY) *</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV *</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={formData.cardCvv}
                          onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {checkoutError && (
                    <div style={{ color: "#ef4444", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500 }}>
                      {checkoutError}
                    </div>
                  )}
                </form>
              )}
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
                  {totalSubtotalFormatted}
                </strong>
              </div>

              {hasDbItems && (
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-sans)",
                    color: "var(--brand-text-muted, #8c8c8c)",
                    background: "rgba(26,18,8,0.03)",
                    padding: 12,
                    borderRadius: 4,
                    marginBottom: 16,
                    lineHeight: 1.4
                  }}
                >
                  Your cart contains certified loose diamonds. Secure checkout is handled directly with the vault clearinghouse.
                </div>
              )}

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

              {showCheckout ? (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || isLoading}
                  style={{
                    display: "block",
                    width: "100%",
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
                    border: 0,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "opacity 150ms ease",
                  }}
                  className="hover:opacity-90"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (hasDbItems) {
                      setShowCheckout(true);
                    } else {
                      window.location.href = cart?.checkoutUrl || "";
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    display: "block",
                    width: "100%",
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
                    border: 0,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "opacity 150ms ease",
                  }}
                  className="hover:opacity-90"
                >
                  Proceed to Checkout
                </button>
              )}

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--brand-text-muted, #8c8c8c)",
                  textAlign: "center",
                  lineHeight: 1.4,
                  marginTop: 16,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Secure checkout is processed via Shopify or direct bank clearing. All prices are inclusive of duties &amp; local VAT.
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--brand-text-secondary)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.15))",
  borderRadius: 4,
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  background: "#fff",
  color: "var(--brand-text-primary)",
  outline: "none",
  transition: "border-color 150ms ease",
};
