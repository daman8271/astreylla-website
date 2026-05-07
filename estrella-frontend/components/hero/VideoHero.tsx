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
        background: "#0d0d0d",
      }}
      aria-label="Astreylla — hero"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.0) 100%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          maxWidth: 1080,
          marginInline: "auto",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#ffffff",
              marginBottom: 8,
              fontWeight: 400,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}
          >
            Your destination for eternal shine
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 30,
              lineHeight: 1.2,
              letterSpacing: 0,
              color: "#ffffff",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            Design the ring you have always imagined.
          </h1>
          <Link
            href="/diamonds"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 200,
              height: 67,
              padding: "0 40px",
              marginTop: 32,
              background: "#ffffff",
              color: "#292929",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              border: 0,
              borderRadius: 0,
              transition: "transform 200ms ease, box-shadow 200ms ease",
            }}
            className="hover:scale-[1.02] hover:shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
