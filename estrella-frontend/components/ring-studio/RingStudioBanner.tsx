import Image from "next/image";
import Link from "next/link";

export function RingStudioBanner() {
  return (
    <section
      style={{
        background: "var(--bg-navy)",
        color: "#ffffff",
        paddingBlock: "clamp(48px, 8vw, 96px)",
      }}
      aria-labelledby="ring-studio-banner-heading"
    >
      <div className="estrella-container rs-home-banner__grid">
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "6592 / 2880",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            background: "#11182a",
          }}
        >
          <Image
            src="/ring-studio-banner.jpg"
            alt="Golden and contemporary diamond rings"
            fill
            sizes="(max-width: 1040px) 100vw, 60vw"
            style={{ objectFit: "cover" }}
            priority={false}
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
            ASTREYLLA
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
