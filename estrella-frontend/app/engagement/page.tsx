import Link from "next/link";

export const metadata = {
  title: "Engagement Rings — Estrella",
  description: "Custom engagement settings paired with certified lab-grown diamonds. Coming soon.",
};

export default function EngagementPage() {
  return (
    <>
      <section
        style={{
          background: "var(--brand-bg-warm)",
          paddingTop: "calc(72px + clamp(32px, 6vw, 80px))",
          paddingBottom: "clamp(32px, 5vw, 64px)",
        }}
      >
        <div className="estrella-container" style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              marginBottom: 12,
            }}
          >
            Coming soon
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              color: "var(--brand-text-primary)",
              marginBottom: 16,
            }}
          >
            Engagement Rings
          </h1>
        </div>
      </section>

      <section
        className="estrella-section"
        style={{ background: "var(--brand-bg)" }}
      >
        <div
          className="estrella-container"
          style={{ textAlign: "center", maxWidth: 640, marginInline: "auto" }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--brand-text-secondary)",
              marginBottom: 32,
            }}
          >
            Build-your-ring is in production. Start by picking a certified
            lab-grown centre stone — settings drop in soon.
          </p>
          <Link href="/diamonds" className="estrella-btn estrella-btn--primary">
            Start with a Diamond
          </Link>
        </div>
      </section>
    </>
  );
}
