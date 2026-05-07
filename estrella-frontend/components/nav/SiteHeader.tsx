"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/diamonds", label: "Loose Diamonds" },
  { href: "/color-diamonds", label: "Color Diamonds" },
  { href: "/gemstones", label: "Gemstones" },
  { href: "/engagement", label: "Engagement" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const onCartClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("estrella:open-cart"));
    }
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <header
        data-scrolled={scrolled}
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300"
        style={{
          backgroundColor: scrolled ? "var(--glass-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(var(--glass-blur))" : "none",
          WebkitBackdropFilter: scrolled ? "blur(var(--glass-blur))" : "none",
          borderBottom: scrolled
            ? "1px solid var(--glass-border)"
            : "1px solid transparent",
        }}
      >
        <div
          className="estrella-container flex items-center justify-between"
          style={{ height: 72 }}
        >
          <Link
            href="/"
            aria-label="Estrella — home"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              letterSpacing: "0.04em",
              color: "var(--brand-text-primary)",
            }}
          >
            ESTRELLA
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center"
            style={{ gap: 40 }}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "var(--brand-text-primary)",
                }}
                className="hover:opacity-70 transition-opacity"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center" style={{ gap: 16 }}>
            <button
              type="button"
              aria-label="Open cart"
              onClick={onCartClick}
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: "var(--brand-text-primary)",
                padding: 8,
              }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden"
              style={{
                background: "transparent",
                border: 0,
                color: "var(--brand-text-primary)",
                padding: 8,
              }}
            >
              {mobileOpen ? (
                <X size={22} strokeWidth={1.5} />
              ) : (
                <Menu size={22} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{
            background: "var(--brand-bg)",
            paddingTop: 72,
          }}
        >
          <nav aria-label="Mobile" className="estrella-container flex flex-col py-8" style={{ gap: 24 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 32,
                  color: "var(--brand-text-primary)",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
