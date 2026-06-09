"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { metalLabel } from "./setting-types";
import { diamondImageUrl } from "@/lib/diamondImage";
import type { RingQuotePayload } from "@/lib/ringQuote";
import { buildRingQuotePayload } from "@/lib/ringQuote";

function capFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

export function StageReview() {
  const router = useRouter();
  const { state } = useRingStudio();
  const { formatPrice, currency } = useCurrency();
  const { diamond, setting, metalKey: chosenMetalKey, shape, region, size } = state;
  const metal = getMetalFromKey(setting, chosenMetalKey);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!setting || !diamond || !metal || !region || !size) {
      router.replace("/ring-studio/setting");
    }
  }, [setting, diamond, metal, region, size, router]);

  if (!diamond || !setting || !metal || !region || !size) {
    return (
      <div className="rs-empty-stage">
        <p>Loading…</p>
      </div>
    );
  }

  const ringShape = shape || diamond.shape || "Round";
  const totalUsd = (diamond.price || 0) + metal.priceUsd;

  const payload: RingQuotePayload = buildRingQuotePayload({
    diamond,
    setting,
    metal,
    shape: ringShape,
    region,
    size,
  });

  const settingImageUrl = metal.imageUrl;
  const diamondImg = diamondImageUrl(diamond.id);

  const productTitle = `Completed Ring (${region} Size ${size.label})`;
  const settingVariant = `${metalLabel(metal)} / ${capFirst(ringShape)}`;
  const diamondDesc = `${Number(diamond.carat).toFixed(2)}ct ${capFirst(diamond.shape || "")} Lab Grown Diamond (Colour ${diamond.color || "—"}, Clarity ${diamond.clarity || "—"})`;

  const buildEmailBody = () => {
    return [
      `Ring Quote Request`,
      ``,
      `Product: ${productTitle}`,
      `Ring Size Region: ${region}`,
      `Ring Size: ${size.label} (${size.value})`,
      `Setting: ${setting.name} (${setting.sku})`,
      `Setting Variant: ${settingVariant}`,
      `Diamond: ${diamondDesc}`,
      `Certificate: ${diamond.lab || "—"}`,
      `Stock No: ${diamond.stockNum || diamond.id}`,
      ``,
      `Setting Price: ${formatPrice(metal.priceUsd)} ${currency}`,
      `Diamond Price: ${formatPrice(diamond.price || 0)} ${currency}`,
      `Total: ${formatPrice(totalUsd)} ${currency}`,
      ``,
      `Quote ID: ${payload.createdAt}`,
    ].join("\n");
  };

  const onCheckout = async () => {
    setSending(true);
    try {
      await fetch("/api/ring-quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // non-blocking — still open mailto
    }
    const subject = encodeURIComponent(`Ring Quote Request — ${setting.name} / ${ringShape}`);
    const body = encodeURIComponent(buildEmailBody());
    window.location.href = `mailto:platform.sales@augmont.com?subject=${subject}&body=${body}`;
    setSent(true);
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,4vw,32px)", fontWeight: 400, letterSpacing: "0.02em", color: "var(--brand-text-primary)" }}>
          Shopping Cart
        </h1>
        <Link
          href="/ring-studio/complete"
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
          Continue Shopping
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
              Subtotal: {formatPrice(totalUsd)} {currency}
            </strong>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand-text-secondary, #6b6b6b)", marginBottom: 16 }}>
            Taxes and shipping calculated at checkout
          </p>

          {sent ? (
            <div style={{ background: "var(--brand-accent-light, #f8f4ec)", border: "1px solid #c9a961", borderRadius: 4, padding: "12px 16px", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--brand-text-primary)", textAlign: "center" }}>
              Quote sent! Our team at Astreylla will contact you within 24 hours.
            </div>
          ) : (
            <button
              type="button"
              onClick={onCheckout}
              disabled={sending}
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
                cursor: sending ? "not-allowed" : "pointer",
                opacity: sending ? 0.6 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              {sending ? "Sending…" : "Check Out"}
            </button>
          )}

          <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--brand-text-secondary, #6b6b6b)", marginTop: 10, textAlign: "center" }}>
            This opens your email client pre-filled with your quote details.<br />
            No payment is taken at this stage.
          </p>
        </div>
      </div>
    </div>
  );
}
