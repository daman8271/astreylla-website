import Link from "next/link";

export function AboutSection() {
  return (
    <section
      className="estrella-section"
      id="about-snippet"
      style={{ background: "var(--brand-bg)" }}
      aria-labelledby="about-heading"
    >
      <div
        className="estrella-container"
        style={{
          display: "grid",
          gap: "clamp(32px, 5vw, 80px)",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            aspectRatio: "16 / 11",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 45%, #1a1a1a 100%)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
              opacity: 0.7,
              mixBlendMode: "overlay",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 30% 35%, rgba(255,255,255,0.10), transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: 28,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.16em",
            }}
          >
            AUGMONT
          </div>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--brand-text-secondary)",
              marginBottom: 12,
            }}
          >
            Our story
          </p>
          <h2
            id="about-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--brand-text-primary)",
              marginBottom: 24,
              maxWidth: "16ch",
            }}
          >
            Crafted with intent, priced with honesty.
          </h2>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: "var(--brand-text-primary)",
              marginBottom: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 540,
            }}
          >
            <p>
              Augmont was built around a single conviction &mdash; buying a diamond
              should not require navigating a maze of markups. We work direct
              with cutters and wholesale labs, then pass the savings through to
              independent jewellers and discerning customers alike.
            </p>
            <p>
              Every stone in our catalogue is independently certified, ethically
              produced, and inspected before it ships. No surprises, no padded
              margins — just the diamond, properly graded, fairly priced.
            </p>
          </div>
          <Link href="/diamonds" className="estrella-btn estrella-btn--pill-dark">
            Browse the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
