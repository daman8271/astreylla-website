"use client";

import { useRouter } from "next/navigation";

type ShapeKey = "round" | "princess" | "cushion" | "oval" | "emerald" | "pear";

const SHAPES: { key: ShapeKey; label: string }[] = [
  { key: "round", label: "Round" },
  { key: "princess", label: "Princess" },
  { key: "cushion", label: "Cushion" },
  { key: "oval", label: "Oval" },
  { key: "emerald", label: "Emerald" },
  { key: "pear", label: "Pear" },
];

function ShapeIcon({ shape }: { shape: ShapeKey }) {
  const stroke = "currentColor";
  const sw = 1.4;
  const fillNone = { fill: "none", stroke, strokeWidth: sw };
  const accent = { stroke, strokeWidth: 0.6, opacity: 0.85, fill: "none" };

  switch (shape) {
    case "round":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="36" {...fillNone} />
          <path
            d="M14 50 L86 50 M50 14 L50 86 M24.6 24.6 L75.4 75.4 M75.4 24.6 L24.6 75.4"
            {...accent}
          />
        </svg>
      );
    case "princess":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect x="18" y="18" width="64" height="64" {...fillNone} />
          <path
            d="M18 18 L82 82 M82 18 L18 82 M50 18 L50 82 M18 50 L82 50"
            {...accent}
          />
        </svg>
      );
    case "cushion":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <rect x="18" y="18" width="64" height="64" rx="14" ry="14" {...fillNone} />
          <path
            d="M28 28 L72 72 M72 28 L28 72 M50 18 L50 82 M18 50 L82 50"
            {...accent}
          />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="26" ry="38" {...fillNone} />
          <path d="M50 12 L50 88 M30 30 L70 70 M70 30 L30 70" {...accent} />
        </svg>
      );
    case "emerald":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M30 16 L70 16 L84 30 L84 70 L70 84 L30 84 L16 70 L16 30 Z"
            {...fillNone}
          />
          <path
            d="M28 28 L72 28 M28 72 L72 72 M28 28 L28 72 M72 28 L72 72 M50 16 L50 84"
            {...accent}
          />
        </svg>
      );
    case "pear":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M50 12 C30 30 22 50 28 70 C32 84 42 88 50 88 C58 88 68 84 72 70 C78 50 70 30 50 12 Z"
            {...fillNone}
          />
          <path d="M50 12 L50 88 M32 50 L68 50 M38 30 L62 30" {...accent} />
        </svg>
      );
  }
}

export function ShapeTilesGrid() {
  const router = useRouter();

  const onTile = (key: ShapeKey, label: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("estrella:filter", { detail: { shape: label } })
      );
    }
    router.push(`/diamonds?d_shape=${encodeURIComponent(label)}`);
  };

  return (
    <section
      className="estrella-section"
      style={{ background: "var(--brand-bg)" }}
      aria-labelledby="shape-tiles-heading"
    >
      <div className="estrella-container">
        <header style={{ marginBottom: 48, textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              marginBottom: 12,
            }}
          >
            Shop by shape
          </p>
          <h2
            id="shape-tiles-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4.5vw, 48px)",
              color: "var(--brand-text-primary)",
            }}
          >
            Find your shape
          </h2>
        </header>

        <ul
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {SHAPES.map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onTile(key, label)}
                aria-label={`Browse ${label} diamonds`}
                style={{
                  width: "100%",
                  background: "var(--brand-bg-section)",
                  border: "1px solid var(--brand-border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "32px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  transition: "transform 200ms ease, border-color 200ms ease, background-color 200ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-text-primary)";
                  e.currentTarget.style.background = "var(--brand-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-border-subtle)";
                  e.currentTarget.style.background = "var(--brand-bg-section)";
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 80,
                    height: 80,
                    color: "var(--brand-text-primary)",
                    display: "block",
                  }}
                >
                  <ShapeIcon shape={key} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: "var(--brand-text-primary)",
                  }}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
