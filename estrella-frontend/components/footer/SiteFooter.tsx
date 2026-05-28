"use client";

import Link from "next/link";

const COL_LEARN = [
  { href: "#", label: "Email Us" },
  { href: "#", label: "Plans" },
];

const COL_DIAMONDS = [
  { href: "/diamonds", label: "Lab Grown Diamonds" },
  { href: "/color-diamonds", label: "Fancy Diamonds" },
];

const COL_BRIDAL = [
  { href: "/engagement", label: "Rings" },
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
          aria-label="Astreylla — home"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            letterSpacing: "0.15em",
            color: "var(--brand-text-primary)",
            paddingBlock: 24,
          }}
        >
          ASTREYLLA
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
              color: "var(--brand-text-primary)",
              marginBottom: 4,
            }}
          >
            Subscribe <span style={{ fontStyle: "normal" }}>now</span>
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--brand-text-secondary)",
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
              border: "1px solid var(--brand-text-primary)",
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
                color: "var(--brand-text-primary)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--brand-text-primary)",
                color: "var(--brand-bg)",
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
              color: "var(--brand-text-muted)",
              marginTop: 12,
            }}
          >
            By subscribing, you agree to our terms &amp; conditions.
          </p>
        </div>

        <FooterCol title="LEARN & GROW" links={COL_LEARN} />
        <FooterCol title="DIAMONDS & GEMSTONES" links={COL_DIAMONDS} />
        <FooterCol title="BRIDAL & RINGS" links={COL_BRIDAL} />
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
            <a
              href="mailto:platform.support@augmont.com"
              style={{ color: "var(--brand-text-primary)" }}
            >
              platform.support@augmont.com
            </a>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {PAYMENTS.map((p) => (
              <PaymentBadge key={p.src} src={p.src} alt={p.alt} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a
              href="#"
              aria-label="Instagram"
              style={{ color: "var(--brand-text-primary)" }}
            >
              <InstagramIcon />
            </a>
            <span>© Copyright, Astreylla Beta, {year}.</span>
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
              className="footer-link transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PAYMENTS = [
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/amex.svg", alt: "American Express" },
  { src: "/payments/paypal.svg", alt: "PayPal" },
  { src: "/payments/discover.svg", alt: "Discover" },
];

function PaymentBadge({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 26,
        padding: "0 8px",
        background: "#ffffff",
        border: "1px solid var(--brand-border-subtle)",
        borderRadius: 4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ height: 15, width: "auto", display: "block" }} />
    </span>
  );
}
