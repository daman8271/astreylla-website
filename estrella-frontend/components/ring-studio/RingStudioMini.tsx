import Link from "next/link";
import Image from "next/image";

const TILES = [
  {
    href: "/ring-studio/setting",
    label: "Start with a",
    italicLabel: "ring",
    image: "/ring-studio/start-with-ring.jpg",
    alt: "Solitaire diamond engagement ring",
    objectPosition: "center",
  },
  {
    href: "/ring-studio/setting",
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
        paddingBlock: "clamp(64px, 8vw, 100px)",
      }}
      aria-labelledby="ring-studio-mini-heading"
    >
      <div
        className="estrella-container"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <h2
            id="ring-studio-mini-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(36px, 4vw, 44px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#ffffff",
            }}
          >
            Ring Studio
          </h2>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(14px, 1.5vw, 16px)",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "46ch",
            fontWeight: 300,
            lineHeight: 1.5
          }}>
            Create a custom piece that tells your unique story. Choose your setting first or start with the perfect certified diamond.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: 32,
            width: "100%",
            maxWidth: 960,
            paddingInline: "clamp(0px, 4vw, 48px)",
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
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
              className="group hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.01]"
            >
              <Image
                src={t.image}
                alt={t.alt}
                fill
                sizes="(max-width: 600px) 90vw, 480px"
                className="transition-transform duration-700 ease-out group-hover:scale-105"
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
                    "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)",
                  pointerEvents: "none",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  left: 28,
                  bottom: 28,
                  fontFamily: "var(--font-display)",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: "clamp(24px, 2.5vw, 30px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
                className="transform transition-transform duration-300 group-hover:-translate-y-1"
              >
                <span>
                  {t.label}{" "}
                  <em style={{ fontStyle: "italic" }}>{t.italicLabel}</em>
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-white/10 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="8" x2="13" y2="8" />
                    <polyline points="9 4 13 8 9 12" />
                  </svg>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
