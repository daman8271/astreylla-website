"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS = [
  {
    name: "The Six-Prong Solitaire",
    sku: "AUG-S-046",
    priceFrom: "$860",
    glyph: "solitaire",
  },
  {
    name: "The Cluster Halo Ring",
    sku: "AUG-C-044",
    priceFrom: "$940",
    glyph: "cluster",
  },
  {
    name: "The Tapered Solitaire",
    sku: "AUG-S-037",
    priceFrom: "$830",
    glyph: "solitaire-thin",
  },
] as const;

function RingGlyph({ kind }: { kind: string }) {
  const stroke = "currentColor";
  if (kind === "cluster") {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="100" cy="130" rx="60" ry="58" fill="none" stroke={stroke} strokeWidth="2" />
        <ellipse cx="100" cy="130" rx="48" ry="46" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="74" r="14" fill="none" stroke={stroke} strokeWidth="1.5" />
        <circle cx="84" cy="80" r="6" fill="none" stroke={stroke} strokeWidth="1" />
        <circle cx="116" cy="80" r="6" fill="none" stroke={stroke} strokeWidth="1" />
        <path d="M86 74 L100 60 L114 74 L100 88 Z" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "solitaire-thin") {
    return (
      <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="100" cy="135" rx="55" ry="53" fill="none" stroke={stroke} strokeWidth="1.5" />
        <ellipse cx="100" cy="135" rx="45" ry="43" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
        <path d="M88 78 L100 60 L112 78 L100 92 Z" fill="none" stroke={stroke} strokeWidth="1.5" />
        <path d="M100 60 L100 92 M88 78 L112 78" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="130" rx="60" ry="58" fill="none" stroke={stroke} strokeWidth="2" />
      <ellipse cx="100" cy="130" rx="48" ry="46" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <path d="M86 76 L100 56 L114 76 L100 96 Z" fill="none" stroke={stroke} strokeWidth="1.8" />
      <path d="M86 76 L114 76 M100 56 L100 96 M86 76 L100 76 L114 76" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

export function BestSellersRow() {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section
      className="estrella-section"
      style={{ background: "var(--brand-bg)", paddingBlock: 96 }}
      aria-labelledby="best-sellers-heading"
    >
      <div className="estrella-container">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 40,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <h2
            id="best-sellers-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--brand-text-primary)",
            }}
          >
            Best{" "}
            <span style={{ fontStyle: "italic" }}>Sellers</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/diamonds"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--brand-text-primary)",
                borderBottom: "1px solid var(--brand-text-primary)",
                paddingBottom: 2,
              }}
            >
              Shop Now
            </Link>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scroll("left")}
              style={{
                width: 36,
                height: 36,
                background: "transparent",
                border: "1px solid var(--brand-border-subtle)",
                borderRadius: "var(--radius-pill)",
                color: "var(--brand-text-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scroll("right")}
              style={{
                width: 36,
                height: 36,
                background: "transparent",
                border: "1px solid var(--brand-border-subtle)",
                borderRadius: "var(--radius-pill)",
                color: "var(--brand-text-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(280px, 1fr)",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            paddingBottom: 4,
          }}
        >
          {PRODUCTS.map((p) => (
            <article
              key={p.sku}
              style={{
                background: "var(--surface-soft)",
                color: "var(--brand-text-primary)",
                borderRadius: "var(--radius-sm)",
                padding: 32,
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                aspectRatio: "1 / 1.05",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RingGlyph kind={p.glyph} />
              </div>
            </article>
          ))}
        </div>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 16,
            listStyle: "none",
            padding: 0,
          }}
        >
          {PRODUCTS.map((p) => (
            <li
              key={`${p.sku}-meta`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--brand-text-primary)",
              }}
            >
              <span>
                <span style={{ fontWeight: 500 }}>{p.name}</span>{" "}
                <span style={{ color: "var(--brand-text-secondary)", fontWeight: 400 }}>
                  ({p.sku})
                </span>
              </span>
              <span style={{ whiteSpace: "nowrap" }}>
                <span
                  style={{
                    color: "var(--brand-text-secondary)",
                    fontWeight: 400,
                    fontSize: 13,
                  }}
                >
                  From{" "}
                </span>
                <span style={{ fontWeight: 500 }}>{p.priceFrom}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
