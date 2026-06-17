"use client";

import { useRouter } from "next/navigation";
import { ShapeMaskIcon, type ShapeName } from "../nav/ShapeMaskIcon";

type ShapeKey = "round" | "pear" | "radiant" | "oval" | "princess" | "cushion" | "emerald";

const SHAPES: { key: ShapeKey; label: string }[] = [
  { key: "round", label: "Round" },
  { key: "pear", label: "Pear" },
  { key: "radiant", label: "Radiant" },
  { key: "oval", label: "Oval" },
  { key: "princess", label: "Princess" },
  { key: "cushion", label: "Cushion" },
  { key: "emerald", label: "Emerald" },
];


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
                    color: "var(--brand-text-primary)",
                    display: "block",
                    lineHeight: 0,
                  }}
                >
                  <ShapeMaskIcon name={key as ShapeName} size={80} />
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
