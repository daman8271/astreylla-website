import Link from "next/link";

export const metadata = {
  title: "About — Estrella",
  description: "Estrella is a wholesale-direct lab-grown diamond house.",
};

export default function AboutPage() {
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
            Our story
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              color: "var(--brand-text-primary)",
              marginBottom: 16,
            }}
          >
            About Estrella
          </h1>
        </div>
      </section>

      <section className="estrella-section" style={{ background: "var(--brand-bg)" }}>
        <div
          className="estrella-container"
          style={{
            display: "grid",
            gap: "clamp(32px, 5vw, 80px)",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            alignItems: "start",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              aspectRatio: "4 / 5",
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 50%, #1a1a1a 100%)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: 32,
                color: "rgba(255,255,255,0.32)",
                letterSpacing: "0.16em",
              }}
            >
              ESTRELLA
            </div>
          </div>

          <article
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.75,
              color: "var(--brand-text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <p>
              We started Estrella because the diamond market is overdue for
              honesty. Layers of distributors, retail markups and unclear
              certifications have made it harder than it should be to buy a
              fairly priced stone.
            </p>
            <p>
              Our model is simple. We work direct with cutters and accredited
              lab-grown facilities, then ship inspected, independently
              certified stones to jewellers and to end customers — at the
              price the trade actually pays.
            </p>
            <p>
              Every diamond ships with a GIA or IGI report, an inspection note
              from our gemologists, and a 30-day no-questions return.
            </p>
            <Link
              href="/diamonds"
              className="estrella-btn estrella-btn--primary"
              style={{ alignSelf: "flex-start", marginTop: 12 }}
            >
              Browse the Collection
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
