import Link from "next/link";

const COL_SHOP = [
  { href: "/diamonds", label: "Loose Diamonds" },
  { href: "/color-diamonds", label: "Color Diamonds" },
  { href: "/gemstones", label: "Gemstones" },
  { href: "/engagement", label: "Engagement Rings" },
];

const COL_EDUCATION = [
  { href: "#", label: "Diamond Buying Guide" },
  { href: "#", label: "4 Cs Explained" },
  { href: "#", label: "Lab-Grown vs Natural" },
  { href: "#", label: "Care & Cleaning" },
];

const COL_COMPANY = [
  { href: "/about", label: "About" },
  { href: "#", label: "Contact" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 4 L20 20 M20 4 L4 20" strokeLinecap="round" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "var(--brand-text-primary)",
        color: "#ffffff",
        marginTop: "auto",
      }}
    >
      <div
        className="estrella-container"
        style={{ paddingBlock: "clamp(48px, 6vw, 96px)" }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 48,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                letterSpacing: "0.04em",
                marginBottom: 16,
              }}
            >
              ESTRELLA
            </div>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                maxWidth: 240,
              }}
            >
              Lab-grown diamonds, jeweller-direct. Certified, ethical,
              wholesale-priced.
            </p>
          </div>

          <FooterCol title="Shop" links={COL_SHOP} />
          <FooterCol title="Education" links={COL_EDUCATION} />
          <FooterCol title="Company" links={COL_COMPANY} />
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            © {year} Estrella. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a
              href="#"
              aria-label="Instagram"
              style={{ color: "rgba(255,255,255,0.7)" }}
              className="hover:!text-white transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              aria-label="X / Twitter"
              style={{ color: "rgba(255,255,255,0.7)" }}
              className="hover:!text-white transition-colors"
            >
              <TwitterIcon />
            </a>
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              VISA · MC · AMEX · PAYPAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#ffffff",
          marginBottom: 20,
        }}
      >
        {title}
      </h4>
      <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link
              href={l.href}
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
              }}
              className="hover:!text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
