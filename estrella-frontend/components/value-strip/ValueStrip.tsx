import { BadgeCheck, Sparkles, Tag } from "lucide-react";

const ITEMS = [
  {
    Icon: BadgeCheck,
    title: "GIA & IGI Certified",
    desc: "Every diamond independently graded by the world's leading gemological labs.",
  },
  {
    Icon: Sparkles,
    title: "Lab-Grown Excellence",
    desc: "Identical brilliance and chemistry — sourced ethically without the mine.",
  },
  {
    Icon: Tag,
    title: "Direct Jeweller Pricing",
    desc: "Wholesale rates passed straight through. No middleman markup.",
  },
];

export function ValueStrip() {
  return (
    <section
      className="estrella-section"
      style={{ background: "var(--brand-bg-warm)" }}
      aria-label="Why Astreylla"
    >
      <div className="estrella-container">
        <ul
          style={{
            display: "grid",
            gap: "clamp(32px, 4vw, 56px)",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {ITEMS.map(({ Icon, title, desc }) => (
            <li
              key={title}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-pill)",
                  background: "rgba(181, 154, 111, 0.14)",
                  color: "var(--brand-accent-gold)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: 0,
                  color: "var(--brand-text-primary)",
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--brand-text-secondary)",
                  maxWidth: "32ch",
                }}
              >
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
