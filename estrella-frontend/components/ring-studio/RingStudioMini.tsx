import Link from "next/link";
import Image from "next/image";

const TILES = [
  {
    href: "/ring-studio/diamond",
    label: "Start with a",
    italicLabel: "ring",
    image: "/ring-studio/start-with-ring.jpg",
    alt: "Solitaire diamond engagement ring",
    objectPosition: "center",
  },
  {
    href: "/ring-studio/diamond",
    label: "Start with a",
    italicLabel: "diamond",
    image: "/ring-studio/start-with-diamond.jpg",
    alt: "Princess-cut diamond",
    objectPosition: "center",
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
                background: "#111111",
                color: "#ffffff",
                position: "relative",
                display: "block",
                overflow: "hidden",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              className="group hover:scale-[1.01] transition-transform"
            >
              <Image
                src={t.image}
                alt={t.alt}
                fill
                sizes="(max-width: 600px) 90vw, 420px"
                style={{
                  objectFit: "cover",
                  objectPosition: t.objectPosition,
                }}
              />

              {/* readability scrim so the label stays legible over light or dark photos */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
                  pointerEvents: "none",
                }}
              />

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
                  color: "#ffffff",
                  textShadow: "0 1px 8px rgba(0,0,0,0.45)",
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
