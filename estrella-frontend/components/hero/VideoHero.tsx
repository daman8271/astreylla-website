"use client";

import Link from "next/link";

export function VideoHero() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "85vh",
        minHeight: 560,
        overflow: "hidden",
        background:
          "var(--hero-bg-image), linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label="Augmont diamonds — hero"
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.0) 100%)",
        }}
      />
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
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          color: "#ffffff",
          maxWidth: "var(--max-content-width)",
        }}
      >
        <div style={{ maxWidth: 600 }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#ffffff",
              marginBottom: 16,
              fontWeight: 500,
              maxWidth: "52ch",
              lineHeight: 1.5,
            }}
          >
            Build your ring &mdash; pick a setting first, or pair it to a centre stone.
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(40px, 7vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.005em",
              color: "#ffffff",
              marginBottom: 36,
              maxWidth: "16ch",
            }}
          >
            Design the ring you have always imagined.
          </h1>
          <Link href="/diamonds" className="estrella-btn estrella-btn--pill-white">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
