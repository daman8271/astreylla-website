"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatMoney, type ProductDetail } from "@/lib/shopify";
import { useCart } from "@/components/cart/CartProvider";

type Variant = ProductDetail["variants"]["edges"][number]["node"];

export function AddToCartForm({ product }: { product: ProductDetail }) {
  const variants = product.variants.edges.map((e) => e.node);
  const optionNames = product.options.map((o) => o.name);
  const isSingle =
    variants.length === 1 && variants[0].title === "Default Title";

  const initialSelected = useMemo<Record<string, string>>(() => {
    const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0];
    const map: Record<string, string> = {};
    if (firstAvailable) {
      for (const o of firstAvailable.selectedOptions) map[o.name] = o.value;
    }
    return map;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(initialSelected);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const matched = useMemo<Variant | undefined>(() => {
    if (isSingle) return variants[0];
    return variants.find((v) =>
      optionNames.every((name) => {
        const target = selected[name];
        const got = v.selectedOptions.find((o) => o.name === name)?.value;
        return target === got;
      })
    );
  }, [variants, optionNames, selected, isSingle]);

  const { addToCart, isLoading } = useCart();

  const onAdd = async () => {
    if (!matched) {
      setFeedback("Please choose all options.");
      return;
    }
    if (!matched.availableForSale) {
      setFeedback("This option is sold out.");
      return;
    }
    setFeedback(null);
    const error = await addToCart(matched.id, qty);
    setFeedback(error ?? "Added to cart");
  };

  const compareAt = matched?.compareAtPrice;
  const onSale =
    !!compareAt &&
    matched &&
    parseFloat(compareAt.amount) > parseFloat(matched.price.amount);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "var(--brand-text-primary)",
          }}
        >
          {matched ? formatMoney(matched.price) : "—"}
        </span>
        {onSale && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              textDecoration: "line-through",
              color: "var(--brand-text-muted)",
            }}
          >
            {formatMoney(compareAt)}
          </span>
        )}
      </div>

      {!isSingle && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {product.options.map((opt) => (
            <fieldset
              key={opt.id}
              style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <legend
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--brand-text-muted)",
                  marginBottom: 4,
                }}
              >
                {opt.name}
                <span style={{ marginLeft: 8, color: "var(--brand-text-primary)", letterSpacing: 0, textTransform: "none" }}>
                  {selected[opt.name]}
                </span>
              </legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opt.optionValues.map((val) => {
                  const active = selected[opt.name] === val.name;
                  const candidate = variants.find((v) =>
                    v.selectedOptions.every((o) =>
                      o.name === opt.name
                        ? o.value === val.name
                        : selected[o.name]
                          ? o.value === selected[o.name]
                          : true
                    )
                  );
                  const disabled = candidate ? !candidate.availableForSale : false;
                  return (
                    <button
                      key={val.id}
                      type="button"
                      aria-pressed={active}
                      disabled={disabled}
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: val.name }))
                      }
                      style={{
                        padding: "10px 18px",
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor: active
                          ? "var(--brand-text-primary, #1a1208)"
                          : "var(--brand-border, rgba(0,0,0,0.14))",
                        background: active
                          ? "var(--brand-text-primary, #1a1208)"
                          : "transparent",
                        color: active
                          ? "var(--brand-bg, #fff)"
                          : "var(--brand-text-primary)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 13,
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.4 : 1,
                        textDecoration: disabled ? "line-through" : "none",
                      }}
                    >
                      {val.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--brand-text-muted)",
          }}
        >
          Quantity
        </span>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid var(--brand-border, rgba(0,0,0,0.14))",
            borderRadius: 999,
            alignSelf: "flex-start",
          }}
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            style={qtyBtn}
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              minWidth: 36,
              textAlign: "center",
            }}
          >
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            style={qtyBtn}
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={isLoading || !matched || !matched.availableForSale}
        style={{
          padding: "16px 28px",
          borderRadius: 999,
          border: 0,
          background: "var(--brand-text-primary, #1a1208)",
          color: "var(--brand-bg, #fff)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          cursor:
            isLoading || !matched || !matched.availableForSale
              ? "not-allowed"
              : "pointer",
          opacity: matched?.availableForSale ? 1 : 0.5,
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        {isLoading
          ? "Adding…"
          : matched && !matched.availableForSale
            ? "Sold out"
            : "Add to cart"}
      </button>

      {feedback && (
        <p
          role="status"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--brand-text-secondary)",
            margin: 0,
          }}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  background: "transparent",
  border: 0,
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--brand-text-primary)",
};
