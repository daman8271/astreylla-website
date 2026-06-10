"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { metalLabel } from "./setting-types";
import { diamondImageUrl } from "@/lib/diamondImage";

function capFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

export function BespokeCartDrawer() {
  const { state, reset: resetRingStudio } = useRingStudio();
  const { formatPrice } = useCurrency();
  const { diamond, setting, metalKey: chosenMetalKey, shape, region, size } = state;
  const metal = getMetalFromKey(setting, chosenMetalKey);

  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderId: string; invoiceNumber?: string } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProv, setStateProv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    const onOpen = () => {
      setIsOpen(true);
      setOrderResult(null);
      setShowCheckout(false);
    };
    window.addEventListener("estrella:open-bespoke-cart", onOpen);
    return () => window.removeEventListener("estrella:open-bespoke-cart", onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  if (!isOpen) return null;

  const canShow = !!(diamond && setting && metal && region && size);
  const totalUsd = canShow ? (diamond!.price || 0) + metal!.priceUsd : 0;
  const settingImageUrl = metal?.imageUrl;
  const diamondImg = diamond ? diamondImageUrl(diamond.id) : null;
  const ringShape = shape || diamond?.shape || "Round";

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canShow) return;
    if (!customerName || !customerEmail || !customerPhone || !streetAddress || !city || !zipCode) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert("Please enter payment details.");
      return;
    }

    setSending(true);
    try {
      const sessionId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("estrella_session_id") ||
            (() => {
              const s = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
              window.localStorage.setItem("estrella_session_id", s);
              return s;
            })()
          : "";

      const shop =
        process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
        "trial-shop-sqxnl71f.myshopify.com";
      const formattedAddress = `${streetAddress}, ${city}, ${stateProv ? stateProv + ", " : ""}${zipCode}, ${country}`;

      const settingDetails = {
        sku: setting!.sku,
        name: setting!.name,
        metal: metalLabel(metal!),
        size: size!.label,
        price: metal!.priceUsd,
      };

      const cardDetails = {
        cardholderName: cardName || customerName,
        cardNumber: cardNumber.replace(/\s+/g, ""),
        expiry: cardExpiry,
        cvv: cardCvv,
      };

      const res = await fetch(`/api/widget/api/public/order/create`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shop,
          sessionId,
          customerEmail,
          customerName,
          customerPhone,
          shippingAddress: formattedAddress,
          settingDetails,
          cardDetails,
          totalAmount: totalUsd,
          orderNote: `Bespoke Ring Studio: setting sku ${setting!.sku}, size ${size!.label}, metal ${metalLabel(metal!)}`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await res.json();
      setOrderResult({
        orderId: orderData.orderId,
        invoiceNumber: orderData.invoiceNumber,
      });
      resetRingStudio();
      window.dispatchEvent(new CustomEvent("estrella-cart-changed"));
    } catch (err) {
      console.error("Order error:", err);
      alert(`Order Failed: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const drawerTitle = orderResult
    ? "Order Confirmed"
    : showCheckout
    ? "Secure Checkout"
    : "Your Bespoke Ring";

  return (
    <>
      <div
        aria-hidden
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,16,12,0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 70,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bespoke ring cart"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(520px, 100vw)",
          background: "var(--brand-bg, #fbf9f6)",
          boxShadow: "-24px 0 60px rgba(20,16,12,0.18)",
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              letterSpacing: "0.02em",
              color: "var(--brand-text-primary)",
              margin: 0,
            }}
          >
            {drawerTitle}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={close}
            style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--brand-text-primary)" }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {orderResult ? (
            /* ── Confirmation ── */
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#eef7ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 400,
                  color: "var(--brand-text-primary)",
                  marginBottom: 12,
                }}
              >
                Order Received!
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--brand-text-secondary)",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Your bespoke ring order is confirmed and being processed.
              </p>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5dfd5",
                  borderRadius: 6,
                  padding: "16px 20px",
                  marginBottom: 24,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #f2ede4",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b" }}>Request ID:</span>
                  <strong style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#1a1a1a" }}>
                    #{orderResult.orderId.slice(-8).toUpperCase()}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "#6b6b6b" }}>Full Reference:</span>
                  <strong style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#1a1a1a", wordBreak: "break-all" }}>
                    {orderResult.orderId}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                style={{
                  padding: "12px 28px",
                  background: "var(--brand-text-primary, #1a1a1a)",
                  color: "#fff",
                  border: 0,
                  borderRadius: 4,
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          ) : !canShow ? (
            /* ── No ring data ── */
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--brand-text-secondary)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
              No ring configuration found. Please complete your ring selection first.
            </div>
          ) : showCheckout ? (
            /* ── Checkout form ── */
            <form id="bespoke-checkout-form" onSubmit={handlePurchase}>
              <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px 0" }}>
                <legend style={legendStyle}>1. Contact Details</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={inputStyle}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      style={inputStyle}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={inputStyle}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: "0 0 24px 0" }}>
                <legend style={legendStyle}>2. Delivery Address</legend>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Street Address *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    style={inputStyle}
                    placeholder="Apartment, street, building"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={inputStyle}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State / Province</label>
                    <input
                      type="text"
                      value={stateProv}
                      onChange={(e) => setStateProv(e.target.value)}
                      style={inputStyle}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      style={inputStyle}
                      placeholder="PIN / Zip"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend style={legendStyle}>3. Payment Details</legend>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Name on Card *</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={inputStyle}
                    placeholder="As displayed on card"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Card Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim();
                      setCardNumber(val);
                    }}
                    style={inputStyle}
                    placeholder="4111 2222 3333 4444"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Expiry *</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                        setCardExpiry(val);
                      }}
                      style={inputStyle}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CVV *</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle}
                      placeholder="•••"
                    />
                  </div>
                </div>
              </fieldset>
            </form>
          ) : (
            /* ── Cart summary ── */
            <div>
              {/* Setting item */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "var(--brand-bg-soft, #f8f6f3)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                >
                  {!imgFailed && settingImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settingImageUrl}
                      alt={setting!.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="14" r="6" stroke="#c9a961" strokeWidth="1.2" />
                        <path d="M9 8 L12 4 L15 8" stroke="#c9a961" strokeWidth="1.2" />
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", marginBottom: 4 }}>
                    {setting!.name}
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    {metalLabel(metal!)} · {capFirst(ringShape)}<br />
                    Size {size!.label} ({region})
                  </p>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", flexShrink: 0 }}>
                  {formatPrice(metal!.priceUsd)}
                </div>
              </div>

              {/* Diamond item */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "var(--brand-bg-soft, #f8f6f3)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {diamondImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={diamondImg}
                      alt="Diamond"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M6 3 L18 3 L21 9 L12 21 L3 9 Z" stroke="#c9a961" strokeWidth="1.2" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", marginBottom: 4 }}>
                    {Number(diamond!.carat).toFixed(2)}ct {capFirst(diamond!.shape || "")} Lab Diamond
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    Colour {diamond!.color || "—"} · Clarity {diamond!.clarity || "—"}<br />
                    {diamond!.lab || "IGI"} Certified
                  </p>
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", flexShrink: 0 }}>
                  {formatPrice(diamond!.price || 0)}
                </div>
              </div>

              {/* Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 0 4px",
                }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--brand-text-primary)" }}>
                  Subtotal
                </span>
                <strong style={{ fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 700, color: "var(--brand-text-primary)" }}>
                  {formatPrice(totalUsd)}
                </strong>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--brand-text-secondary)", margin: "4px 0 0" }}>
                Taxes and shipping calculated at checkout.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!orderResult && canShow && (
          <footer
            style={{
              padding: "16px 24px 28px",
              borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
              background: "var(--brand-bg-warm, #f5efe6)",
              flexShrink: 0,
            }}
          >
            {showCheckout ? (
              <>
                <button
                  type="submit"
                  form="bespoke-checkout-form"
                  disabled={sending}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    background: "var(--brand-accent-gold, #c9a961)",
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    border: 0,
                    borderRadius: 4,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.7 : 1,
                    boxShadow: "0 4px 12px rgba(201,169,97,0.15)",
                    marginBottom: 10,
                  }}
                >
                  {sending ? "Processing…" : "Purchase It"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  style={{
                    background: "transparent",
                    border: 0,
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "var(--brand-text-secondary)",
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  ← Back to Cart
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  background: "var(--brand-text-primary, #1a1a1a)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: 0,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </button>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  background: "#fff",
  border: "1px solid #dcd6cd",
  borderRadius: 4,
  outline: "none",
  color: "var(--brand-text-primary, #1a1a1a)",
  transition: "border-color 150ms ease",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  background: "#fff",
  border: "1px solid #dcd6cd",
  borderRadius: 4,
  outline: "none",
  color: "var(--brand-text-primary, #1a1a1a)",
  appearance: "none",
  boxSizing: "border-box",
};

const legendStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--brand-text-primary, #1a1a1a)",
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 11,
  color: "var(--brand-text-secondary, #6b6b6b)",
  marginBottom: 6,
};
