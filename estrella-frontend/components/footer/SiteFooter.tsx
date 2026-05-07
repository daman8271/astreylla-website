"use client";

import Link from "next/link";

const COL_LEARN = [
  { href: "#", label: "Email Us" },
  { href: "#", label: "Plans" },
];

const COL_DIAMONDS = [
  { href: "/diamonds", label: "Natural Diamonds" },
  { href: "/diamonds", label: "Lab Grown Diamonds" },
  { href: "/color-diamonds", label: "Colored Diamonds" },
  { href: "/color-diamonds", label: "Colored Natural Gemstones" },
];

const COL_BRIDAL = [
  { href: "/engagement", label: "Engagement Rings" },
  { href: "/diamonds", label: "Wedding Bands" },
  { href: "/diamonds", label: "Anniversary" },
];

const COL_HELP = [
  { href: "#", label: "Diamond Buying Guide" },
  { href: "#", label: "Gemstones Guide" },
  { href: "#", label: "Emerald Gemstones" },
  { href: "#", label: "Sapphire Gemstones" },
  { href: "#", label: "Ruby Gemstones" },
];

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "var(--bg-cream)",
        color: "var(--brand-text-primary)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          padding: "40px 32px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid var(--brand-border-subtle)",
        }}
      >
        <Link
          href="/"
          aria-label="Augmont — home"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            letterSpacing: "0.15em",
            color: "var(--brand-text-primary)",
            paddingBlock: 24,
          }}
        >
          AUGMONT
        </Link>
      </div>

      <div
        className="estrella-container"
        style={{
          paddingTop: 56,
          paddingBottom: 40,
          display: "grid",
          gridTemplateColumns:
            "minmax(220px, 1.2fr) repeat(auto-fit, minmax(180px, 1fr))",
          gap: 48,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 18,
              color: "#292929",
              marginBottom: 4,
            }}
          >
            Subscribe <span style={{ fontStyle: "normal" }}>now</span>
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "#5a5a5a",
              marginBottom: 16,
            }}
          >
            Learn more about us and our reviews
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: "flex",
              alignItems: "stretch",
              border: "1px solid #292929",
              maxWidth: 360,
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="ENTER YOUR EMAIL"
              style={{
                flex: 1,
                background: "transparent",
                border: 0,
                outline: "none",
                padding: "12px 14px",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.12em",
                color: "#292929",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#292929",
                color: "#ffffff",
                border: 0,
                padding: "12px 22px",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.16em",
                fontWeight: 500,
              }}
            >
              JOIN
            </button>
          </form>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "#9b9b9b",
              marginTop: 12,
            }}
          >
            By subscribing, you agree to our terms &amp; conditions.
          </p>
        </div>

        <FooterCol title="LEARN & GROW" links={COL_LEARN} />
        <FooterCol title="DIAMONDS & GEMSTONES" links={COL_DIAMONDS} />
        <FooterCol title="BRIDAL & ENGAGEMENT" links={COL_BRIDAL} />
        <FooterCol title="HELP & GUIDE" links={COL_HELP} />
      </div>

      <div
        style={{
          borderTop: "1px solid var(--brand-border-subtle)",
        }}
      >
        <div
          className="estrella-container"
          style={{
            paddingBlock: 20,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--brand-text-secondary)",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span>USD $</span>
            <span style={{ color: "var(--brand-text-primary)" }}>
              hello@augmont.example
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <PaymentChip>VISA</PaymentChip>
            <PaymentChip>MC</PaymentChip>
            <PaymentChip>AMEX</PaymentChip>
            <PaymentChip>PAYPAL</PaymentChip>
            <PaymentChip>DISC</PaymentChip>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a
              href="#"
              aria-label="Instagram"
              style={{ color: "var(--brand-text-primary)" }}
            >
              <InstagramIcon />
            </a>
            <span>© Copyright, Augmont Beta, {year}.</span>
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
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--brand-text-primary)",
          marginBottom: 20,
        }}
      >
        {title}
      </h4>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 0,
          margin: 0,
          listStyle: "none",
        }}
      >
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link
              href={l.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 400,
                color: "var(--brand-text-secondary)",
              }}
              className="hover:!text-[#1a1a1a] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
        height: 22,
        padding: "0 6px",
        background: "#ffffff",
        border: "1px solid var(--brand-border-subtle)",
        borderRadius: 3,
        fontFamily: "var(--font-sans)",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#5a5a5a",
      }}
    >
      {children}
    </span>
  );
}
