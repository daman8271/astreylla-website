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
      style={{ 
        background: "var(--brand-bg-warm)",
        paddingBlock: "clamp(80px, 10vw, 120px)"
      }}
      aria-label="Why Astreylla"
    >
      <div className="estrella-container">
        <ul
          style={{
            display: "grid",
            gap: "clamp(40px, 5vw, 64px)",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            listStyle: "none",
            padding: 0,
            margin: "0 auto",
            maxWidth: 1200,
          }}
        >
          {ITEMS.map(({ Icon, title, desc }) => (
            <li
              key={title}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 16,
                padding: "32px 24px",
                borderRadius: "16px",
                transition: "transform 300ms ease, background-color 300ms ease",
              }}
              className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            >
              <span
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-pill)",
                  background: "rgba(181, 154, 111, 0.12)",
                  color: "var(--brand-accent-gold)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 300ms ease, background-color 300ms ease",
                  marginBottom: 8,
                }}
                className="group-hover:scale-110 group-hover:bg-[rgba(181,154,111,0.18)]"
              >
                <Icon size={28} strokeWidth={1.5} />
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(18px, 2vw, 22px)",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: "var(--brand-text-primary)",
                  margin: 0,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(14px, 1.6vw, 15px)",
                  lineHeight: 1.6,
                  color: "var(--brand-text-secondary)",
                  maxWidth: "36ch",
                  margin: 0,
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
