"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { metalLabel } from "./setting-types";
import { diamondImageUrl } from "@/lib/diamondImage";

function capFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

export function StageReview() {
  const router = useRouter();
  const { state, reset: resetRingStudio } = useRingStudio();
  const { formatPrice, currency } = useCurrency();
  const { diamond, setting, metalKey: chosenMetalKey, shape, region, size } = state;
  const metal = getMetalFromKey(setting, chosenMetalKey);

  const [showCheckout, setShowCheckout] = useState(false);
  const [sending, setSending] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProv, setStateProv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  
  // Card states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [orderResult, setOrderResult] = useState<{ orderId: string; invoiceNumber?: string } | null>(null);

  useEffect(() => {
    // If order is not complete and no result has been generated, bounce back
    if (!orderResult && (!setting || !diamond || !metal || !region || !size)) {
      router.replace("/ring-studio/setting");
    }
  }, [setting, diamond, metal, region, size, router, orderResult]);

  if (orderResult) {
    return (
      <div style={{ maxWidth: 640, margin: "80px auto", padding: "40px 24px", background: "#fcfaf7", border: "1px solid #e5dfd5", borderRadius: 8, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#eef7ee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, color: "var(--brand-text-primary)", marginBottom: 16 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--brand-text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          Thank you for your purchase. Your bespoke ring order has been received and is currently being processed.
        </p>
        
        <div style={{ background: "#ffffff", border: "1px solid #e5dfd5", borderRadius: 6, padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid #f2ede4", paddingBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-secondary)" }}>Request/Order ID:</span>
            <strong style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)" }}>{orderResult.orderId}</strong>
          </div>
          {orderResult.invoiceNumber && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, borderBottom: "1px solid #f2ede4", paddingBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-secondary)" }}>Augmont Invoice No:</span>
              <strong style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)" }}>{orderResult.invoiceNumber}</strong>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-secondary)" }}>Confirmation Sent To:</span>
            <strong style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)" }}>{customerEmail}</strong>
          </div>
        </div>

        <Link
          href="/diamonds"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "var(--brand-text-primary, #1a1a1a)",
            color: "var(--brand-bg, #ffffff)",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: 4,
            textDecoration: "none",
            transition: "opacity 150ms ease",
          }}
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  if (!diamond || !setting || !metal || !region || !size) {
    return (
      <div className="rs-empty-stage">
        <p>Loading…</p>
      </div>
    );
  }

  const ringShape = shape || diamond.shape || "Round";
  const totalUsd = (diamond.price || 0) + metal.priceUsd;

  const productTitle = `Completed Ring (${region} Size ${size.label})`;
  const settingVariant = `${metalLabel(metal)} / ${capFirst(ringShape)}`;
  const diamondDesc = `${Number(diamond.carat).toFixed(2)}ct ${capFirst(diamond.shape || "")} Lab Grown Diamond (Colour ${diamond.color || "—"}, Clarity ${diamond.clarity || "—"})`;
  const settingImageUrl = metal.imageUrl;
  const diamondImg = diamondImageUrl(diamond.id);

  const backUrl = (() => {
    const sp = new URLSearchParams();
    if (setting) sp.set("settingSku", setting.sku);
    if (chosenMetalKey) sp.set("metal", chosenMetalKey);
    if (shape || diamond?.shape) sp.set("shape", (shape || diamond?.shape) as string);
    if (diamond) sp.set("diamondId", diamond.id);
    return `/ring-studio/complete?${sp.toString()}`;
  })();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !streetAddress || !city || !zipCode) {
      alert("Please fill in all required shipping and contact details.");
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
      const shop = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "trial-shop-sqxnl71f.myshopify.com";
      const formattedAddress = `${streetAddress}, ${city}, ${stateProv ? stateProv + ", " : ""}${zipCode}, ${country}`;

      const settingDetails = {
        sku: setting.sku,
        name: setting.name,
        metal: metalLabel(metal),
        size: size.label,
        price: metal.priceUsd,
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
          orderNote: `Bespoke Ring Studio: setting sku ${setting.sku}, size ${size.label}, metal ${metalLabel(metal)}`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create order on backend");
      }

      const orderData = await res.json();
      setOrderResult({
        orderId: orderData.orderId,
        invoiceNumber: orderData.invoiceNumber,
      });

      // Reset Ring Studio state
      resetRingStudio();
      
      // Notify other components (like Cart count)
      window.dispatchEvent(new CustomEvent("estrella-cart-changed"));
    } catch (err) {
      console.error("Order creation error:", err);
      alert(`Order Creation Failed: ${(err as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px" }}>
      {!showCheckout ? (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,4vw,32px)", fontWeight: 400, letterSpacing: "0.02em", color: "var(--brand-text-primary)" }}>
              Shopping Cart
            </h1>
            <Link
              href={backUrl}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--brand-text-secondary, #6b6b6b)",
                textDecoration: "none",
                borderBottom: "1px solid currentColor",
              }}
            >
              Back to Customization
            </Link>
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", gap: 16, paddingBottom: 12, borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.12))", marginBottom: 0 }}>
            {["Product", "Price", "Quantity", "Total"].map((h) => (
              <span key={h} style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brand-text-secondary, #6b6b6b)" }}>{h}</span>
            ))}
          </div>

          {/* Product row */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", gap: 16, alignItems: "start", padding: "24px 0", borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))" }}>
            {/* Product column */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {/* Product image */}
              <div style={{ width: 96, height: 96, borderRadius: 4, overflow: "hidden", background: "var(--brand-bg-soft, #f8f6f3)", flexShrink: 0, border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))" }}>
                {!imgFailed && settingImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settingImageUrl}
                    alt={setting.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setImgFailed(true)}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="14" r="6" stroke="#c9a961" strokeWidth="1.2" />
                      <path d="M9 8 L12 4 L15 8" stroke="#c9a961" strokeWidth="1.2" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Product details */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", marginBottom: 6 }}>
                  {productTitle}
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary, #6b6b6b)", lineHeight: 1.7, margin: 0 }}>
                  Ring Size Region: {region}<br />
                  Ring Size: {size.label}<br />
                  Setting: {setting.name} ({setting.sku})<br />
                  Setting Variant: {settingVariant}<br />
                  Diamond: {diamondDesc}
                </p>
                {/* Diamond thumbnail */}
                {diamondImg && (
                  <div style={{ marginTop: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={diamondImg}
                      alt="Diamond"
                      style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4, border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))", background: "#fff" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--brand-text-primary)", paddingTop: 4 }}>
              {formatPrice(totalUsd)}
            </div>

            {/* Quantity — always 1 for bespoke ring */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
              <button type="button" disabled style={{ width: 28, height: 28, border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.15))", background: "transparent", fontSize: 16, cursor: "not-allowed", opacity: 0.4, borderRadius: 2 }}>−</button>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, minWidth: 20, textAlign: "center" }}>1</span>
              <button type="button" disabled style={{ width: 28, height: 28, border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.15))", background: "transparent", fontSize: 16, cursor: "not-allowed", opacity: 0.4, borderRadius: 2 }}>+</button>
            </div>

            {/* Total */}
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--brand-text-primary)", paddingTop: 4 }}>
              {formatPrice(totalUsd)}
            </div>
          </div>

          {/* Subtotal + checkout */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
            <div style={{ minWidth: 320 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-text-primary)" }}>
                  Subtotal: {formatPrice(totalUsd)}
                </strong>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary, #6b6b6b)", marginBottom: 16 }}>
                Taxes and shipping calculated at checkout
              </p>

              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 24px",
                  background: "var(--brand-text-primary, #1a1a1a)",
                  color: "var(--brand-bg, #ffffff)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: 0,
                  cursor: "pointer",
                  transition: "opacity 150ms ease",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handlePurchase} style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 40, alignItems: "start" }}>
          {/* Left Column: Form Inputs */}
          <div>
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              style={{
                background: "transparent",
                border: 0,
                color: "var(--brand-text-secondary, #6b6b6b)",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              ← Back to Cart
            </button>

            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--brand-text-primary)", marginBottom: 24 }}>
              Secure Checkout
            </h2>

            {/* Contact Details */}
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 32px 0" }}>
              <legend style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-text-primary)", marginBottom: 16 }}>
                1. Customer & Contact Details
              </legend>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="customerName" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Full Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="customerEmail" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Email Address *</label>
                  <input
                    type="email"
                    id="customerEmail"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="customerPhone" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Phone Number *</label>
                <input
                  type="tel"
                  id="customerPhone"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="+91 98765 43210"
                />
              </div>
            </fieldset>

            {/* Shipping Address */}
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 32px 0" }}>
              <legend style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-text-primary)", marginBottom: 16 }}>
                2. Shipping / Delivery Address
              </legend>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="streetAddress" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Street Address *</label>
                <input
                  type="text"
                  id="streetAddress"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  style={inputStyle}
                  placeholder="Apartment, suite, unit, building, street"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label htmlFor="city" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>City *</label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={inputStyle}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label htmlFor="stateProv" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>State / Province</label>
                  <input
                    type="text"
                    id="stateProv"
                    value={stateProv}
                    onChange={(e) => setStateProv(e.target.value)}
                    style={inputStyle}
                    placeholder="State / Province"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="zipCode" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Postal / Zip Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    style={inputStyle}
                    placeholder="PIN / Zip Code"
                  />
                </div>
                <div>
                  <label htmlFor="country" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Country *</label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Payment Details (Mocked) */}
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--brand-text-primary)", marginBottom: 16 }}>
                3. Payment Details (Mock Gateway)
              </legend>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="cardName" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Name on Card *</label>
                <input
                  type="text"
                  id="cardName"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  style={inputStyle}
                  placeholder="As displayed on card"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="cardNumber" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                    setCardNumber(val);
                  }}
                  style={inputStyle}
                  placeholder="4111 2222 3333 4444"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="cardExpiry" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>Expiry Date *</label>
                  <input
                    type="text"
                    id="cardExpiry"
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
                  <label htmlFor="cardCvv" style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginBottom: 6 }}>CVV Code *</label>
                  <input
                    type="password"
                    id="cardCvv"
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
          </div>

          {/* Right Column: Order Review Panel */}
          <div style={{ background: "#fbf9f6", border: "1px solid #e5dfd5", borderRadius: 6, padding: "24px 28px", position: "sticky", top: 120 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--brand-text-primary)", marginBottom: 20, borderBottom: "1px solid #e5dfd5", paddingBottom: 12 }}>
              Order Summary
            </h3>

            {/* Small Ring details snippet */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 4, overflow: "hidden", background: "#fff", border: "1px solid #e5dfd5", flexShrink: 0 }}>
                {settingImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settingImageUrl} alt="Setting" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div>
                <strong style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)" }}>{setting.name} ({setting.sku})</strong>
                <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginTop: 2 }}>{settingVariant} · Size {size.label}</span>
              </div>
            </div>

            {/* Small Diamond details snippet */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, borderBottom: "1px solid #e5dfd5", paddingBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 4, overflow: "hidden", background: "#fff", border: "1px solid #e5dfd5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {diamondImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={diamondImg} alt="Diamond" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 3 L18 3 L21 9 L12 21 L3 9 Z" stroke="#c9a961" strokeWidth="1.2" /></svg>
                )}
              </div>
              <div>
                <strong style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)" }}>{Number(diamond.carat).toFixed(2)}ct {diamond.shape || ""} Diamond</strong>
                <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary)", marginTop: 2 }}>Color {diamond.color || "—"} · Clarity {diamond.clarity || "—"} · {diamond.lab || "IGI"}</span>
              </div>
            </div>

            {/* Pricing details */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-secondary)" }}>
              <span>Setting Price</span>
              <span>{formatPrice(metal.priceUsd)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-secondary)" }}>
              <span>Diamond Price</span>
              <span>{formatPrice(diamond.price || 0)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5dfd5", paddingTop: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--brand-text-primary)" }}>Total Amount</span>
              <strong style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--brand-text-primary)" }}>{formatPrice(totalUsd)}</strong>
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 24px",
                background: "var(--brand-accent-gold, #c9a961)",
                color: "#ffffff",
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
                transition: "opacity 150ms ease",
              }}
            >
              {sending ? "Processing Purchase…" : "Complete Purchase"}
            </button>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--brand-text-secondary)", marginTop: 12, textAlign: "center", lineHeight: 1.4 }}>
              By completing purchase, your transaction will be recorded and sent to the order management dashboard.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  background: "#ffffff",
  border: "1px solid #dcd6cd",
  borderRadius: 4,
  outline: "none",
  color: "var(--brand-text-primary)",
  transition: "border-color 150ms ease",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  background: "#ffffff",
  border: "1px solid #dcd6cd",
  borderRadius: 4,
  outline: "none",
  color: "var(--brand-text-primary)",
  appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'%3E%3Cpath stroke='%236b6b6b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

