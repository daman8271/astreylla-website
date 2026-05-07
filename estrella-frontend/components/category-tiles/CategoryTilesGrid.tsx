import Link from "next/link";

const TILES = [
  {
    href: "/diamonds",
    label: "Natural Diamonds",
    bg: "linear-gradient(135deg, #1f1f1f 0%, #2e2e2e 60%, #161616 100%)",
    accent: "#c9c4ba",
  },
  {
    href: "/diamonds",
    label: "Lab Grown Diamonds",
    bg: "linear-gradient(135deg, #15201a 0%, #28342b 60%, #0e1612 100%)",
    accent: "#cfd9d2",
  },
  {
    href: "/color-diamonds",
    label: "Fancy Color Diamonds",
    bg: "linear-gradient(135deg, #2c1d2a 0%, #3a2536 60%, #1a131a 100%)",
    accent: "#e2c9d9",
  },
  {
    href: "/gemstones",
    label: "Gemstones",
    bg: "linear-gradient(135deg, #1a2436 0%, #243049 60%, #11182a 100%)",
    accent: "#cdd6e4",
  },
];

function TileGlyph({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ width: 64, height: 64, color }}
    >
      <path
        d="M50 14 L78 38 L62 84 L38 84 L22 38 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M22 38 L78 38 M50 14 L50 84 M38 84 L22 38 L50 14 L78 38 L62 84"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
    </svg>
  );
}

export function CategoryTilesGrid() {
  return (
    <section
      className="estrella-section"
      style={{ background: "var(--brand-bg)", paddingBlock: 96 }}
      aria-labelledby="categories-heading"
    >
      <div className="estrella-container">
        <header style={{ marginBottom: 40 }}>
          <h2
            id="categories-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 36px)",
              color: "var(--brand-text-primary)",
              fontStyle: "normal",
            }}
          >
            Shop by{" "}
            <span style={{ fontStyle: "italic" }}>category</span>
          </h2>
        </header>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {TILES.map((t) => (
            <li key={t.label}>
              <Link
                href={t.href}
                style={{
                  display: "block",
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  background: t.bg,
                  color: "#ffffff",
                }}
                className="group hover:brightness-110 transition-[filter] duration-300"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TileGlyph color={t.accent} />
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 20,
                    bottom: 20,
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    letterSpacing: "0.04em",
                    color: "#ffffff",
                  }}
                >
                  {t.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
