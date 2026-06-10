import "@/components/diamonds/diamonds.css";
import { DiamondCatalog } from "@/components/diamonds/DiamondCatalog";

export const metadata = {
  title: "Fancy Color Diamonds — Astreylla",
  description:
    "Browse our curated collection of lab-grown fancy color diamonds — vivid yellows, bold blues, blushing pinks and more. Certified, jeweller-direct.",
};

const SHOP =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "trial-shop-sqxnl71f.myshopify.com";

export default function FancyDiamondsPage() {
  return (
    <>
      {/* ── Hero header ─────────────────────────────────────── */}
      <section
        style={{
          background:
            "linear-gradient(135deg,#fff7e6 0%,#fdf0f8 50%,#eef4ff 100%)",
          paddingTop: "calc(72px + clamp(32px, 6vw, 80px))",
          paddingBottom: "clamp(32px, 5vw, 64px)",
        }}
        aria-labelledby="fancy-heading"
      >
        <div className="estrella-container" style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              marginBottom: 12,
            }}
          >
            Where Color Meets Brilliance
          </p>
          <h1
            id="fancy-heading"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              color: "var(--brand-text-primary)",
              marginBottom: 16,
            }}
          >
            Fancy Colour Diamonds
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
            Experience the extraordinary allure of Fancy Colour Diamonds. Carefully selected for their remarkable color, rarity, and sparkle, these diamonds transform every piece into a statement of elegance and distinction.
          </p>

          {/* colour swatch strip */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Yellow",  from: "#fadf66", to: "#e8c044" },
              { label: "Blue",    from: "#729fcf", to: "#2f5fb5" },
              { label: "Pink",    from: "#ffccd5", to: "#ec97b3" },
              { label: "Green",   from: "#7fc06d", to: "#3f8a4a" },
              { label: "Purple",  from: "#a07cc8", to: "#6c4ba0" },
              { label: "Red",     from: "#e74c4c", to: "#a82a2a" },
            ].map(({ label, from, to }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--brand-text-secondary)",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${from},${to})`,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catalog ─────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--brand-bg)",
          paddingBlock: "clamp(32px, 5vw, 64px)",
        }}
      >
        <div className="estrella-container">
          <DiamondCatalog shop={SHOP} perPage={12} mode="fancy" />
        </div>
      </section>
    </>
  );
}
