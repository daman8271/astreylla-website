"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Moon, Sun, Search, ChevronDown } from "lucide-react";
import { MegaMenu, type MegaMenuConfig } from "./MegaMenu";
import { useTheme } from "@/components/theme/ThemeProvider";

type NavItem = {
  href: string;
  label: string;
  menu?: MegaMenuConfig;
};

const DIAMONDS_MENU: MegaMenuConfig = {
  columns: [
    {
      heading: "Diamond shapes",
      items: [
        { label: "Round", href: "/diamonds?shape=Round" },
        { label: "Princess", href: "/diamonds?shape=Princess" },
        { label: "Cushion", href: "/diamonds?shape=Cushion" },
        { label: "Oval", href: "/diamonds?shape=Oval" },
        { label: "Pear", href: "/diamonds?shape=Pear" },
        { label: "Emerald", href: "/diamonds?shape=Emerald" },
        { label: "Marquise", href: "/diamonds?shape=Marquise" },
        { label: "Heart", href: "/diamonds?shape=Heart" },
        { label: "Asscher", href: "/diamonds?shape=Asscher" },
        { label: "Radiant", href: "/diamonds?shape=Radiant" },
      ],
      more: { label: "Browse all shapes", href: "/diamonds" },
    },
    {
      heading: "Diamond type",
      items: [
        { label: "Natural diamonds", href: "/diamonds?treatment=natural" },
        { label: "Lab-grown diamonds", href: "/diamonds?treatment=lab-grown" },
      ],
      more: { label: "Compare types", href: "/diamonds" },
    },
    {
      heading: "Popular searches",
      items: [
        { label: "Round 1ct", href: "/diamonds?shape=Round" },
        { label: "Oval 1.5ct", href: "/diamonds?shape=Oval" },
        { label: "Cushion 2ct", href: "/diamonds?shape=Cushion" },
        { label: "Emerald 1ct", href: "/diamonds?shape=Emerald" },
      ],
    },
    {
      heading: "Education",
      items: [
        { label: "The 4 Cs", href: "/diamonds" },
        { label: "Cut grades", href: "/diamonds" },
        { label: "Clarity scale", href: "/diamonds" },
        { label: "Color guide", href: "/diamonds" },
      ],
      more: { label: "All guides", href: "/about" },
    },
  ],
  promo: {
    eyebrow: "DIAMONDS",
    cta: { label: "Shop now", href: "/diamonds" },
  },
};

const COLORED_MENU: MegaMenuConfig = {
  columns: [
    {
      heading: "Fancy colors",
      items: [
        { label: "Yellow diamonds", href: "/color-diamonds" },
        { label: "Pink diamonds", href: "/color-diamonds" },
        { label: "Blue diamonds", href: "/color-diamonds" },
        { label: "Green diamonds", href: "/color-diamonds" },
        { label: "Brown diamonds", href: "/color-diamonds" },
        { label: "Black diamonds", href: "/color-diamonds" },
      ],
      more: { label: "Browse all colors", href: "/color-diamonds" },
    },
    {
      heading: "Intensity",
      items: [
        { label: "Faint", href: "/color-diamonds" },
        { label: "Light", href: "/color-diamonds" },
        { label: "Fancy light", href: "/color-diamonds" },
        { label: "Fancy", href: "/color-diamonds" },
        { label: "Fancy intense", href: "/color-diamonds" },
        { label: "Fancy vivid", href: "/color-diamonds" },
      ],
    },
    {
      heading: "Education",
      items: [
        { label: "Why fancy diamonds?", href: "/about" },
        { label: "Color rarity", href: "/about" },
        { label: "Investment grade", href: "/about" },
      ],
    },
  ],
  promo: {
    eyebrow: "COLORED DIAMONDS",
    cta: { label: "Shop now", href: "/color-diamonds" },
  },
};

const GEMSTONES_MENU: MegaMenuConfig = {
  columns: [
    {
      heading: "Gemstone types",
      items: [
        { label: "Emerald", href: "/gemstones" },
        { label: "Ruby", href: "/gemstones" },
        { label: "Sapphire", href: "/gemstones" },
        { label: "Garnet", href: "/gemstones" },
        { label: "Tourmaline", href: "/gemstones" },
        { label: "Topaz", href: "/gemstones" },
        { label: "Citrine", href: "/gemstones" },
        { label: "Opal", href: "/gemstones" },
      ],
      more: { label: "Browse all types", href: "/gemstones" },
    },
    {
      heading: "Gemstone shapes",
      items: [
        { label: "Round", href: "/gemstones" },
        { label: "Square", href: "/gemstones" },
        { label: "Oval", href: "/gemstones" },
        { label: "Emerald", href: "/gemstones" },
        { label: "Pear", href: "/gemstones" },
        { label: "Heart", href: "/gemstones" },
      ],
      more: { label: "Browse all shapes", href: "/gemstones" },
    },
    {
      heading: "Gemstone colors",
      items: [
        { label: "Yellow gemstones", href: "/gemstones" },
        { label: "Red gemstones", href: "/gemstones" },
        { label: "Blue gemstones", href: "/gemstones" },
        { label: "Pink gemstones", href: "/gemstones" },
        { label: "Green gemstones", href: "/gemstones" },
        { label: "Purple gemstones", href: "/gemstones" },
      ],
      more: { label: "Browse all colors", href: "/gemstones" },
    },
    {
      heading: "Education",
      items: [
        { label: "Emerald guide", href: "/about" },
        { label: "Ruby guide", href: "/about" },
        { label: "Sapphire guide", href: "/about" },
      ],
      more: { label: "Browse all gemstone guides", href: "/about" },
    },
  ],
  promo: {
    eyebrow: "GEMSTONES",
    cta: { label: "Shop now", href: "/gemstones" },
  },
};

const ENGAGEMENT_MENU: MegaMenuConfig = {
  columns: [
    {
      heading: "Ring style",
      items: [
        { label: "Solitaire", href: "/engagement" },
        { label: "Halo", href: "/engagement" },
        { label: "Three-stone", href: "/engagement" },
        { label: "Vintage", href: "/engagement" },
        { label: "Pavé", href: "/engagement" },
      ],
      more: { label: "Browse all styles", href: "/engagement" },
    },
    {
      heading: "Metal",
      items: [
        { label: "Yellow gold", href: "/engagement" },
        { label: "White gold", href: "/engagement" },
        { label: "Rose gold", href: "/engagement" },
        { label: "Platinum", href: "/engagement" },
      ],
    },
    {
      heading: "Build your ring",
      items: [
        { label: "Start with a setting", href: "/engagement" },
        { label: "Start with a diamond", href: "/diamonds" },
      ],
      more: { label: "Design your ring", href: "/engagement" },
    },
  ],
  promo: {
    eyebrow: "ENGAGEMENT",
    cta: { label: "Design your ring", href: "/engagement" },
  },
};

const NAV_ITEMS: NavItem[] = [
  { href: "/diamonds", label: "Diamonds", menu: DIAMONDS_MENU },
  { href: "/color-diamonds", label: "Colored Diamonds", menu: COLORED_MENU },
  { href: "/gemstones", label: "Gemstones", menu: GEMSTONES_MENU },
  { href: "/engagement", label: "Engagement", menu: ENGAGEMENT_MENU },
  { href: "/about", label: "About" },
];

const DARK_HERO_PATHS = new Set<string>(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Hover-to-open with a small grace delay so moving the cursor across the
  // gap between the nav link and the panel doesn't snap-close the menu.
  const scheduleClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const openMenuFor = (label: string) => {
    cancelClose();
    setOpenMenu(label);
  };
  const closeMenu = () => {
    cancelClose();
    setOpenMenu(null);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onCount = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      if (detail) setCartCount(detail.count);
    };
    window.addEventListener("estrella:cart-count", onCount);
    return () => window.removeEventListener("estrella:cart-count", onCount);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Esc closes any open mega-menu.
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMenu]);

  // Route changes close the menu.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const onCartClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("estrella:open-cart"));
    }
  };

  // Mega-menu open forces the header into its solid-white "scrolled" state
  // even on the dark-hero homepage, so the dropdown panel reads cleanly.
  const onDarkHero =
    DARK_HERO_PATHS.has(pathname || "/") && !scrolled && !openMenu;
  const fg = onDarkHero ? "#ffffff" : "var(--brand-text-primary)";
  const headerSolid = scrolled || !!openMenu;

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
        data-menu-open={openMenu ? "true" : "false"}
        data-tone={onDarkHero ? "dark" : "light"}
        onMouseLeave={scheduleClose}
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,color] duration-300"
        style={{
          backgroundColor: openMenu
            ? "#ffffff"
            : headerSolid
              ? "var(--glass-bg)"
              : "transparent",
          backdropFilter: headerSolid && !openMenu ? "blur(var(--glass-blur))" : "none",
          WebkitBackdropFilter:
            headerSolid && !openMenu ? "blur(var(--glass-blur))" : "none",
          borderBottom: headerSolid
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
            aria-label="Astreylla — home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-astreylla.jpeg"
              alt=""
              aria-hidden
              style={{
                height: 56,
                width: "auto",
                maxWidth: 220,
                display: "block",
              }}
            />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center"
            style={{ gap: 40 }}
          >
            {NAV_ITEMS.map((l) => (
              <div
                key={l.href}
                onMouseEnter={l.menu ? () => openMenuFor(l.label) : undefined}
                onMouseLeave={l.menu ? scheduleClose : undefined}
                style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
              >
                <Link
                  href={l.href}
                  onClick={() => closeMenu()}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: fg,
                    textShadow: onDarkHero ? "0 1px 8px rgba(0,0,0,0.35)" : "none",
                    transition: "color 200ms ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    height: 72,
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-haspopup={l.menu ? "true" : undefined}
                  aria-expanded={l.menu ? openMenu === l.label : undefined}
                >
                  {l.label}
                  {l.menu ? <ChevronDown size={14} strokeWidth={1.5} /> : null}
                </Link>
              </div>
            ))}
          </nav>

          <div className="hidden md:flex items-center" style={{ gap: 20 }}>
            <button
              type="button"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              aria-pressed={theme === "dark"}
              onClick={toggleTheme}
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: fg,
                padding: 8,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </button>

            {/* Mock search — placeholder, not wired */}
            <button
              type="button"
              aria-label="Search (coming soon)"
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: fg,
                padding: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <Search size={18} strokeWidth={1.5} />
              <span>Search</span>
            </button>

            {/* Mock country / currency switcher — placeholder, not wired */}
            <button
              type="button"
              aria-label="Country and currency (US)"
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: fg,
                padding: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  overflow: "hidden",
                  fontSize: 22,
                  lineHeight: "22px",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}
              >
                🇺🇸
              </span>
              <span>US</span>
            </button>

            <button
              type="button"
              aria-label={`Open cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
              onClick={onCartClick}
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: fg,
                padding: 8,
                position: "relative",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>Cart ({cartCount > 99 ? "99+" : cartCount})</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden"
            style={{
              background: "transparent",
              border: 0,
              color: fg,
              padding: 8,
              transition: "color 200ms ease",
            }}
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>

        {openMenu
          ? (() => {
              const item = NAV_ITEMS.find((i) => i.label === openMenu);
              return item?.menu ? (
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                  <MegaMenu config={item.menu} onClose={closeMenu} />
                </div>
              ) : null;
            })()
          : null}
      </header>

      {/* Backdrop dim under the open mega-menu — clicking it closes. */}
      {openMenu ? (
        <div
          aria-hidden
          onClick={closeMenu}
          className="hidden md:block fixed inset-0 z-40"
          style={{ background: "rgba(20,18,14,0.18)", top: 0 }}
        />
      ) : null}

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{
            background: "var(--brand-bg)",
            paddingTop: 72,
          }}
        >
          <nav aria-label="Mobile" className="estrella-container flex flex-col py-8" style={{ gap: 24 }}>
            {NAV_ITEMS.map((l) => (
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
