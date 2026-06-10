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
        preload="metadata"
        poster="/hero-poster.jpg"
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
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(24px, 4.5vw, 48px)",
              lineHeight: 1.2,
              letterSpacing: 0,
              color: "#ffffff",
              margin: 0,
              maxWidth: "none",
              whiteSpace: "nowrap",
            }}
          >
            Where Your Love Story Sparkles
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(13px, 2.5vw, 16px)",
              letterSpacing: "0.02em",
              color: "#f0f0f0",
              marginTop: 12,
              marginBottom: 0,
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Discover exquisite diamonds and handcrafted jewelry designed to celebrate every milestone.
          </p>
          <Link
            href="/ring-studio/setting"
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
