import Image from "next/image";
import Link from "next/link";

export function RingStudioBanner() {
  return (
    <section
      style={{
        background: "var(--bg-navy)",
        color: "#ffffff",
        width: "100%",
        overflow: "hidden",
      }}
      aria-labelledby="ring-studio-banner-heading"
    >
      <div className="rs-home-banner__grid">
        <div className="rs-home-banner__image-wrapper">
          <Image
            src="/ring-studio-banner.jpg"
            alt="Golden and contemporary diamond rings"
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            padding: "clamp(48px, 6vw, 96px) 24px",
          }}
        >
          <h2
            id="ring-studio-banner-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              marginBottom: 16,
              maxWidth: "24ch",
              marginInline: "auto",
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
            ASTREYLLA
          </div>
          <Link
            href="/ring-studio/setting"
            className="estrella-btn estrella-btn--pill-outline"
          >
            Explore the Ring Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
