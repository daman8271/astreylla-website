import Link from "next/link";

export function RingStudioBanner() {
  return (
    <section
      style={{
        background: "var(--bg-navy)",
        color: "#ffffff",
        paddingBlock: 96,
      }}
      aria-labelledby="ring-studio-banner-heading"
    >
      <div
        className="estrella-container"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 280px) 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            aspectRatio: "3 / 4",
            background:
              "linear-gradient(160deg, #243049 0%, #11182a 60%, #1c2438 100%)",
            borderRadius: "var(--radius-sm)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08), transparent 60%)",
            }}
          />
        </div>

        <div>
          <h2
            id="ring-studio-banner-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "clamp(24px, 3vw, 32px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              marginBottom: 16,
              maxWidth: "20ch",
            }}
          >
            Custom rings, made to{" "}
            <em style={{ fontStyle: "italic" }}>mark the moment</em>.
          </h2>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.85)",
              marginBottom: 32,
            }}
          >
            AUGMONT
          </div>
          <Link
            href="/ring-studio/diamond"
            className="estrella-btn estrella-btn--pill-outline"
          >
            Explore the Ring Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
