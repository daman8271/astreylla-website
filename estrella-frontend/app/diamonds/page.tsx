import { DiamondWidgetEmbed } from "@/components/widget-embed/DiamondWidgetEmbed";

export const metadata = {
  title: "Loose Diamonds — Estrella",
  description:
    "Browse our curated collection of certified lab-grown loose diamonds, jeweller-direct.",
};

export default function DiamondsPage() {
  return (
    <>
      <section
        style={{
          background: "var(--brand-bg-warm)",
          paddingTop: "calc(72px + clamp(32px, 6vw, 80px))",
          paddingBottom: "clamp(32px, 5vw, 64px)",
        }}
        aria-labelledby="diamonds-heading"
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
            The collection
          </p>
          <h1
            id="diamonds-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              color: "var(--brand-text-primary)",
              marginBottom: 16,
            }}
          >
            Loose Diamonds
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--brand-text-secondary)",
              maxWidth: "60ch",
              marginInline: "auto",
            }}
          >
            Every stone certified, every price wholesale. Filter by shape,
            carat, clarity and cut to find the diamond that&apos;s right for
            you.
          </p>
        </div>
      </section>

      <section
        style={{
          background: "var(--brand-bg)",
          paddingBlock: "clamp(32px, 5vw, 64px)",
        }}
      >
        <div className="estrella-container">
          <DiamondWidgetEmbed />
        </div>
      </section>
    </>
  );
}
