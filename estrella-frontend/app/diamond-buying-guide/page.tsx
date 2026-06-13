import Link from "next/link";

export const metadata = {
  title: "Diamond Buying Guide — Astreylla",
  description:
    "Learn about the science of diamond beauty: the 4Cs (Cut, Color, Clarity, Carat Weight) and the mastery of precision diamond cutting craftsmanship.",
};

export default function DiamondBuyingGuidePage() {
  return (
    <div style={{ background: "var(--brand-bg)", color: "var(--brand-text-primary)", overflow: "hidden" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--brand-bg-warm) 0%, var(--brand-bg) 100%)",
          paddingTop: "calc(72px + clamp(48px, 8vw, 100px))",
          paddingBottom: "clamp(48px, 6vw, 96px)",
          borderBottom: "1px solid var(--brand-border-subtle)",
        }}
      >
        <div className="estrella-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "center",
            }}
            className="guide-hero-grid"
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--brand-accent-gold)",
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                Education & Guides
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(42px, 5.5vw, 64px)",
                  lineHeight: 1.1,
                  fontWeight: 400,
                  marginBottom: 24,
                  letterSpacing: "-0.01em",
                }}
              >
                Diamond Buying <br /><em>Guide</em>
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(16px, 2vw, 20px)",
                  lineHeight: 1.6,
                  color: "var(--brand-text-secondary)",
                  maxWidth: "48ch",
                  marginBottom: 0,
                }}
              >
                A masterclass in understanding the science of light, the intricacies of the 4Cs, and the precision craft that unlocks a stone&apos;s true fire and brilliance.
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.08)",
                  aspectRatio: "1.25 / 1",
                  background: "#f0f0f0",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/guide-hero.jpg"
                  alt="Emerald cut trilogy engagement ring resting on a rose stem"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Understanding the Science of Diamond Beauty */}
      <section style={{ paddingBlock: "var(--section-pad-y)" }}>
        <div className="estrella-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: "clamp(32px, 5vw, 80px)",
              alignItems: "start",
            }}
            className="guide-grid-split"
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 4.5vw, 44px)",
                  lineHeight: 1.15,
                  marginBottom: 20,
                }}
              >
                Understanding the Science of Diamond Beauty
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "var(--brand-text-secondary)",
                  marginBottom: 36,
                }}
              >
                A diamond’s beauty is defined by the 4Cs — Cut, Color, Clarity, and Carat Weight. Introduced by Robert M. Shipley, the 4Cs provide a universal standard for evaluating a diamond’s quality, brilliance, and value.
              </p>

              {/* The 4Cs Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
                className="guide-4cs-grid"
              >
                <div
                  style={{
                    padding: 24,
                    border: "1px solid var(--brand-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--brand-bg-warm)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      marginBottom: 10,
                      color: "var(--brand-accent-gold)",
                    }}
                  >
                    Cut
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--brand-text-secondary)" }}>
                    The most important factor influencing a diamond’s sparkle. Cut refers to the proportions, symmetry, and facet arrangement that determine how light is reflected, creating brilliance, fire, and scintillation.
                  </p>
                </div>

                <div
                  style={{
                    padding: 24,
                    border: "1px solid var(--brand-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--brand-bg-warm)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      marginBottom: 10,
                      color: "var(--brand-accent-gold)",
                    }}
                  >
                    Color
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--brand-text-secondary)" }}>
                    Measures the presence or absence of color in a diamond. The less color a diamond displays, the rarer and more valuable it is, resulting in a brighter, more luminous appearance.
                  </p>
                </div>

                <div
                  style={{
                    padding: 24,
                    border: "1px solid var(--brand-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--brand-bg-warm)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      marginBottom: 10,
                      color: "var(--brand-accent-gold)",
                    }}
                  >
                    Clarity
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--brand-text-secondary)" }}>
                    Evaluates the size, number, position, and visibility of internal inclusions and external blemishes. Higher clarity grades indicate fewer natural characteristics and greater visual purity.
                  </p>
                </div>

                <div
                  style={{
                    padding: 24,
                    border: "1px solid var(--brand-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--brand-bg-warm)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      marginBottom: 10,
                      color: "var(--brand-accent-gold)",
                    }}
                  >
                    Carat Weight
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--brand-text-secondary)" }}>
                    The standard unit used to measure a diamond’s weight. While larger diamonds are rarer, carat weight should be considered alongside the other 3Cs to determine overall beauty and value.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ alignSelf: "center", position: "relative" }}>
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.06)",
                  aspectRatio: "1.25 / 1",
                  background: "#f0f0f0",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/guide-fancy.jpg"
                  alt="A selection of high-clarity loose lab-grown colored diamonds"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Cut — Where a Diamond's Beauty Comes to Life */}
      <section
        style={{
          background: "var(--brand-bg-warm)",
          paddingBlock: "var(--section-pad-y)",
          borderTop: "1px solid var(--brand-border-subtle)",
          borderBottom: "1px solid var(--brand-border-subtle)",
        }}
      >
        <div className="estrella-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(32px, 5vw, 64px)",
              alignItems: "center",
            }}
            className="guide-hero-grid"
          >
            <div style={{ order: 2 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 4.5vw, 44px)",
                  lineHeight: 1.15,
                  marginBottom: 24,
                }}
              >
                Cut: Where a Diamond’s Beauty Comes to Life
              </h2>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: "var(--brand-text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <p>
                  Among the 4Cs, cut is often the easiest quality to notice. Even to an untrained eye, a well-cut diamond stands out through its exceptional brilliance, fire, and sparkle. It is the characteristic that creates the immediate visual impact—the moment that makes people stop and admire a diamond.
                </p>
                <p>
                  More than just a measure of quality, cut reflects the skill and craftsmanship of the diamond cutter. In its natural state, a rough diamond may appear ordinary and unremarkable. It is only through expert cutting and precise faceting that its true beauty is revealed, transforming a rough stone into a breathtaking gem.
                </p>
              </div>
            </div>
            <div style={{ order: 1 }}>
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.08)",
                  aspectRatio: "1 / 1",
                  background: "#f0f0f0",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/guide-hand.jpg"
                  alt="A stunning round-brilliant solitaire diamond ring set in gold"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          paddingBlock: "clamp(64px, 8vw, 120px)",
          textAlign: "center",
        }}
      >
        <div className="estrella-container">
          <div
            style={{
              maxWidth: 720,
              marginInline: "auto",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 5vw, 48px)",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Ready to find your perfect stone?
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--brand-text-secondary)",
                marginBottom: 40,
              }}
            >
              Explore our curated inventory of certified lab-grown diamonds, or begin creating a custom engagement ring setting.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <Link href="/diamonds" className="estrella-btn estrella-btn--primary">
                Search Diamonds
              </Link>
              <Link href="/ring-studio/setting" className="estrella-btn estrella-btn--outline">
                Design a Ring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded CSS for responsive columns layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 868px) {
          .guide-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .guide-hero-grid > div {
            order: initial !important;
          }
          .guide-grid-split {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 580px) {
          .guide-4cs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
