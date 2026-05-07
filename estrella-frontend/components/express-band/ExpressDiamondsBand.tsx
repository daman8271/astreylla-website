import Link from "next/link";

function StonePedestalGlyph() {
  return (
    <svg
      viewBox="0 0 220 260"
      aria-hidden="true"
      style={{ width: "100%", height: "auto", maxWidth: 240 }}
    >
      <defs>
        <linearGradient id="band-stone-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fafafa" />
          <stop offset="45%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#8a8a8a" />
        </linearGradient>
        <linearGradient id="band-ring-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#6f6f6f" />
        </linearGradient>
      </defs>
      <ellipse
        cx="110"
        cy="180"
        rx="74"
        ry="68"
        fill="none"
        stroke="url(#band-ring-grad)"
        strokeWidth="6"
      />
      <ellipse
        cx="110"
        cy="180"
        rx="58"
        ry="52"
        fill="none"
        stroke="url(#band-ring-grad)"
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M86 92 L110 56 L134 92 L110 124 Z"
        fill="url(#band-stone-grad)"
        stroke="#1a1a1a"
        strokeWidth="0.8"
      />
      <path
        d="M86 92 L134 92 M110 56 L110 124 M86 92 L98 92 L110 92 L122 92 L134 92"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="0.6"
        opacity="0.55"
      />
    </svg>
  );
}

export function ExpressDiamondsBand() {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #262626 50%, #111111 100%)",
        color: "#ffffff",
        paddingBlock: 100,
        position: "relative",
        overflow: "hidden",
      }}
      aria-labelledby="express-heading"
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: 0.6,
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="estrella-container"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) 1fr",
          gap: "clamp(40px, 8vw, 96px)",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <StonePedestalGlyph />
        </div>

        <div>
          <h2
            id="express-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              marginBottom: 16,
              maxWidth: "20ch",
            }}
          >
            From order to door in{" "}
            <em style={{ fontStyle: "italic" }}>five days</em>.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 32,
              maxWidth: "44ch",
            }}
          >
            Quality, speed, and price &mdash; without compromise.
          </p>
          <Link
            href="/diamonds"
            className="estrella-btn estrella-btn--pill-white"
          >
            Shop Express Diamonds
          </Link>
        </div>
      </div>
    </section>
  );
}
