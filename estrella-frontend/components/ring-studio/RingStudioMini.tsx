import Link from "next/link";

function RingTileGlyph() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "55%", height: "55%" }}>
      <ellipse cx="100" cy="130" rx="56" ry="54" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
      <ellipse cx="100" cy="130" rx="44" ry="42" fill="none" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.5" />
      <path d="M86 80 L100 60 L114 80 L100 96 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.4" />
      <path d="M100 60 L100 96 M86 80 L114 80" fill="none" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

function DiamondTileGlyph() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" style={{ width: "55%", height: "55%" }}>
      <defs>
        <linearGradient id="mini-stone-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f0f0f0" />
          <stop offset="50%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#9b9b9b" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="68" fill="url(#mini-stone-grad)" stroke="#1a1a1a" strokeWidth="1" />
      <circle cx="100" cy="100" r="46" fill="none" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.4" />
      <path d="M32 100 L168 100 M100 32 L100 168 M52 52 L148 148 M148 52 L52 148 M100 32 L146 100 L100 168 L54 100 Z" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.55" />
    </svg>
  );
}

const TILES = [
  {
    href: "/ring-studio/diamond",
    label: "Start with a",
    italicLabel: "ring",
    Glyph: RingTileGlyph,
  },
  {
    href: "/ring-studio/diamond",
    label: "Start with a",
    italicLabel: "diamond",
    Glyph: DiamondTileGlyph,
  },
];

export function RingStudioMini() {
  return (
    <section
      style={{
        background: "var(--bg-charcoal)",
        color: "#ffffff",
        paddingBlock: 64,
      }}
      aria-labelledby="ring-studio-mini-heading"
    >
      <div
        className="estrella-container"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}
      >
        <h2
          id="ring-studio-mini-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 24,
            letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          Ring Studio
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 32,
            width: "100%",
            maxWidth: 880,
            paddingLeft: 96,
            paddingRight: 96,
          }}
        >
          {TILES.map((t, i) => (
            <Link
              key={`${t.italicLabel}-${i}`}
              href={t.href}
              style={{
                aspectRatio: "1 / 1",
                background: "#ffffff",
                color: "#1a1a1a",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "var(--radius-sm)",
              }}
              className="hover:scale-[1.01] transition-transform"
            >
              <t.Glyph />
              <span
                style={{
                  position: "absolute",
                  left: 24,
                  bottom: 24,
                  fontFamily: "var(--font-display)",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "#1a1a1a",
                }}
              >
                {t.label}{" "}
                <em style={{ fontStyle: "italic" }}>{t.italicLabel}</em>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
