"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Moon, Sun, Search, ChevronDown } from "lucide-react";
import { MegaMenu, type MegaMenuConfig, type MegaMenuItem } from "./MegaMenu";
import { CountrySelector } from "./CountrySelector";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ShapeMaskIcon, type ShapeName } from "./ShapeMaskIcon";
import { RingStyleMaskIcon, type RingStyleName } from "./RingStyleMaskIcon";

type NavItem = {
  href: string;
  label: string;
  menu?: MegaMenuConfig;
};

// Detailed cropped diamond-cut PNGs rendered via CSS mask so they pick up
// the surrounding text color (light/dark theme aware) in one asset.
const ShapeIcon = ({ name }: { name: ShapeName }) => (
  <ShapeMaskIcon name={name} size={22} />
);

// Color swatch dot (filled circle with the listed color).
const ColorDot = ({ color }: { color: string }) => (
  <span
    className="ds-mega__dot"
    style={{ background: color }}
    aria-hidden
  />
);

// Conic-gradient swatch — used for fancy colored diamonds where each color
// reads as a small "pie" that hints at the wider hue family.
const ColorPie = ({ from, to }: { from: string; to: string }) => (
  <span
    className="ds-mega__dot"
    style={{
      background: `conic-gradient(from 0deg, ${from}, ${to}, ${from})`,
    }}
    aria-hidden
  />
);

// Metal chip — a circle in the metal's tone with a bold 14K/18K/PT label.
const MetalChip = ({
  bg,
  fg,
  text,
  border,
}: {
  bg: string;
  fg: string;
  text: string;
  border?: string;
}) => (
  <span
    className="ds-mega__chip"
    style={{
      background: bg,
      color: fg,
      border: border ? `1px solid ${border}` : undefined,
    }}
    aria-hidden
  >
    {text}
  </span>
);

// ── DIAMONDS MEGA-MENU ────────────────────────────────────────────────────
const SHAPE_ITEM = (
  label: string,
  shape: ShapeName,
  href: string
): MegaMenuItem => ({ label, href, icon: <ShapeIcon name={shape} /> });

const DIAMOND_SHAPES_LAB: MegaMenuItem[] = [
  SHAPE_ITEM("Round", "round", "/diamonds?shape=Round&treatment=lab-grown"),
  SHAPE_ITEM("Princess", "princess", "/diamonds?shape=Princess&treatment=lab-grown"),
  SHAPE_ITEM("Oval", "oval", "/diamonds?shape=Oval&treatment=lab-grown"),
  SHAPE_ITEM("Radiant", "radiant", "/diamonds?shape=Radiant&treatment=lab-grown"),
  SHAPE_ITEM("Pear", "pear", "/diamonds?shape=Pear&treatment=lab-grown"),
  SHAPE_ITEM("Heart", "heart", "/diamonds?shape=Heart&treatment=lab-grown"),
  SHAPE_ITEM("Marquise", "marquise", "/diamonds?shape=Marquise&treatment=lab-grown"),
];

const DIAMONDS_MENU: MegaMenuConfig = {
  columns: [
    {
      groups: [
        {
          heading: "Ring Studio",
          items: [
            {
              label: "Start with a setting",
              href: "/ring-studio/setting",
              icon: <RingStyleMaskIcon name="solitaire" size={22} />,
            },
            {
              label: "Start with a diamond",
              href: "/diamonds",
              icon: <ShapeIcon name="round" />,
            },
          ],
        },
        {
          heading: "Diamonds on sale",
          items: [
            { label: "Diamonds under $1,000", href: "/diamonds?maxFinalPrice=1000" },
            { label: "Diamonds under $10,000", href: "/diamonds?maxFinalPrice=10000" },
          ],
        },
      ],
    },
    {
      heading: "Diamonds",
      items: DIAMOND_SHAPES_LAB,
      more: { label: "Browse all shapes", href: "/diamonds?treatment=lab-grown" },
    },
  ],
  promos: [
    {
      eyebrow: "LOOSE LAB-GROWN DIAMONDS",
      cta: { label: "Browse all", href: "/diamonds?treatment=lab-grown" },
    },
  ],
  footer: {
    heading: "Education",
    items: [
      { label: "Diamond buying guide", href: "/diamonds" },
      { label: "The 4 Cs", href: "/diamonds" },
      { label: "Cut grades", href: "/diamonds" },
      { label: "Clarity scale", href: "/diamonds" },
      { label: "Color guide", href: "/diamonds" },
    ],
    more: { label: "All guides", href: "/diamonds" },
  },
};

// ── FANCY DIAMONDS MEGA-MENU ─────────────────────────────────────────────
const COLORED_SHAPES: MegaMenuItem[] = [
  SHAPE_ITEM("Round", "round", "/color-diamonds"),
  SHAPE_ITEM("Princess", "princess", "/color-diamonds"),
  SHAPE_ITEM("Oval", "oval", "/color-diamonds"),
  SHAPE_ITEM("Radiant", "radiant", "/color-diamonds"),
  SHAPE_ITEM("Pear", "pear", "/color-diamonds"),
  SHAPE_ITEM("Heart", "heart", "/color-diamonds"),
];

const COLORED_COLORS: MegaMenuItem[] = [
  { label: "Yellow diamonds", href: "/color-diamonds", icon: <ColorPie from="#fadf66" to="#e8c044" /> },
  { label: "Red diamonds", href: "/color-diamonds", icon: <ColorPie from="#e74c4c" to="#a82a2a" /> },
  { label: "Blue diamonds", href: "/color-diamonds", icon: <ColorPie from="#5a86d6" to="#2f5fb5" /> },
  { label: "Pink diamonds", href: "/color-diamonds", icon: <ColorPie from="#f7c4d2" to="#ec97b3" /> },
  { label: "Green diamonds", href: "/color-diamonds", icon: <ColorPie from="#7fc06d" to="#3f8a4a" /> },
  { label: "Purple diamonds", href: "/color-diamonds", icon: <ColorPie from="#a07cc8" to="#6c4ba0" /> },
];

const COLORED_MENU: MegaMenuConfig = {
  columns: [
    {
      groups: [
        {
          heading: "Ring Studio",
          items: [
            {
              label: "Start with a setting",
              href: "/ring-studio/setting",
              icon: <RingStyleMaskIcon name="solitaire" size={22} />,
            },
            {
              label: "Start with a fancy diamond",
              href: "/color-diamonds",
              icon: <ShapeIcon name="round" />,
            },
          ],
        },
      ],
    },
    {
      heading: "Fancy diamonds",
      items: COLORED_SHAPES,
      more: { label: "Browse all shapes", href: "/color-diamonds" },
    },
    {
      heading: "Fancy diamonds",
      items: COLORED_COLORS,
      more: { label: "Browse all colors", href: "/color-diamonds" },
    },
  ],
  promos: [
    {
      eyebrow: "FANCY DIAMONDS",
      cta: { label: "Shop now", href: "/color-diamonds" },
    },
  ],
  footer: {
    heading: "Education",
    items: [
      { label: "Why fancy diamonds?", href: "/color-diamonds" },
      { label: "Color rarity", href: "/color-diamonds" },
      { label: "Intensity grading", href: "/color-diamonds" },
      { label: "Investment grade", href: "/color-diamonds" },
    ],
    more: { label: "All fancy diamond guides", href: "/color-diamonds" },
  },
};

// ── GEMSTONES MEGA-MENU ──────────────────────────────────────────────────
const GEMSTONE_SHAPES: MegaMenuItem[] = [
  SHAPE_ITEM("Round", "round", "/gemstones"),
  { label: "Square", href: "/gemstones", icon: <ShapeIcon name="princess" /> },
  SHAPE_ITEM("Oval", "oval", "/gemstones"),
  SHAPE_ITEM("Emerald", "emerald", "/gemstones"),
  SHAPE_ITEM("Pear", "pear", "/gemstones"),
  SHAPE_ITEM("Heart", "heart", "/gemstones"),
];

const GEMSTONE_COLORS: MegaMenuItem[] = [
  { label: "Yellow gemstones", href: "/gemstones", icon: <ColorPie from="#fadf66" to="#e8c044" /> },
  { label: "Red gemstones", href: "/gemstones", icon: <ColorPie from="#e74c4c" to="#a82a2a" /> },
  { label: "Blue gemstones", href: "/gemstones", icon: <ColorPie from="#5a86d6" to="#2f5fb5" /> },
  { label: "Pink gemstones", href: "/gemstones", icon: <ColorPie from="#f7c4d2" to="#ec97b3" /> },
  { label: "Green gemstones", href: "/gemstones", icon: <ColorPie from="#7fc06d" to="#3f8a4a" /> },
  { label: "Purple gemstones", href: "/gemstones", icon: <ColorPie from="#a07cc8" to="#6c4ba0" /> },
];

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
      items: GEMSTONE_SHAPES,
      more: { label: "Browse all shapes", href: "/gemstones" },
    },
    {
      heading: "Gemstone colors",
      items: GEMSTONE_COLORS,
      more: { label: "Browse all colors", href: "/gemstones" },
    },
  ],
  promos: [
    {
      eyebrow: "GEMSTONES",
      cta: { label: "Shop now", href: "/gemstones" },
    },
  ],
  footer: {
    heading: "Education",
    items: [
      { label: "Emerald guide", href: "/gemstones" },
      { label: "Ruby guide", href: "/gemstones" },
      { label: "Sapphire guide", href: "/gemstones" },
      { label: "Gemstone buying guide", href: "/gemstones" },
    ],
    more: { label: "Browse all gemstone guides", href: "/gemstones" },
  },
};

// ── RINGS MEGA-MENU ──────────────────────────────────────────────────────
const RING_SHAPES: MegaMenuItem[] = [
  SHAPE_ITEM("Round", "round", "/ring-studio/setting?shapes=Round"),
  SHAPE_ITEM("Princess", "princess", "/ring-studio/setting?shapes=Princess"),
  SHAPE_ITEM("Oval", "oval", "/ring-studio/setting?shapes=Oval"),
  SHAPE_ITEM("Radiant", "radiant", "/ring-studio/setting?shapes=Radiant"),
  SHAPE_ITEM("Pear", "pear", "/ring-studio/setting?shapes=Pear"),
  SHAPE_ITEM("Heart", "heart", "/ring-studio/setting?shapes=Heart"),
];

const RING_STYLES: MegaMenuItem[] = [
  { label: "Solitaire", href: "/ring-studio/setting?styles=Solitaire", icon: <RingStyleMaskIcon name="solitaire" /> },
  { label: "Pave", href: "/ring-studio/setting?styles=Pave", icon: <RingStyleMaskIcon name="pave" /> },
  { label: "Halo", href: "/ring-studio/setting?styles=Halo", icon: <RingStyleMaskIcon name="halo" /> },
  { label: "Hidden Halo", href: "/ring-studio/setting?styles=Hidden%20Halo", icon: <RingStyleMaskIcon name="hidden-halo" /> },
  { label: "Nature", href: "/ring-studio/setting?styles=Nature", icon: <RingStyleMaskIcon name="nature" /> },
  { label: "Trilogy", href: "/ring-studio/setting?styles=Three-Stone", icon: <RingStyleMaskIcon name="trilogy" /> },
  { label: "Vintage", href: "/ring-studio/setting?styles=Side%20Stone", icon: <RingStyleMaskIcon name="vintage" /> },
];

const RING_METALS: MegaMenuItem[] = [
  {
    label: "14k Yellow Gold",
    href: "/ring-studio/setting?metalKeys=14K-Yellow",
    icon: <MetalChip bg="#f1d27a" fg="#7a5b1a" text="14K" />,
  },
  {
    label: "18k Yellow Gold",
    href: "/ring-studio/setting?metalKeys=18K-Yellow",
    icon: <MetalChip bg="#e9c25a" fg="#5a4112" text="18K" />,
  },
  {
    label: "14k Rose Gold",
    href: "/ring-studio/setting?metalKeys=14K-Rose",
    icon: <MetalChip bg="#eac0b0" fg="#7a3f2c" text="14K" />,
  },
  {
    label: "18k Rose Gold",
    href: "/ring-studio/setting?metalKeys=18K-Rose",
    icon: <MetalChip bg="#dba38e" fg="#5e2d1d" text="18K" />,
  },
  {
    label: "14k White Gold",
    href: "/ring-studio/setting?metalKeys=14K-White",
    icon: <MetalChip bg="#e8e6e0" fg="#3d3d3d" text="14K" border="#cfcdc7" />,
  },
  {
    label: "18k White Gold",
    href: "/ring-studio/setting?metalKeys=18K-White",
    icon: <MetalChip bg="#dcdad4" fg="#2c2c2c" text="18K" border="#bfbdb7" />,
  },
  {
    label: "950 Platinum",
    href: "/ring-studio/setting?metalKeys=PT-Platinum",
    icon: <MetalChip bg="#e2e1dc" fg="#3d3d3d" text="PT" border="#bfbdb7" />,
  },
];

const ENGAGEMENT_MENU: MegaMenuConfig = {
  columns: [
    {
      groups: [
        {
          heading: "Ring Studio",
          items: [
            {
              label: "Start with a setting",
              href: "/ring-studio/setting",
              icon: <RingStyleMaskIcon name="solitaire" size={22} />,
            },
            {
              label: "Start with a diamond",
              href: "/diamonds?treatment=lab-grown",
              icon: <ShapeIcon name="round" />,
            },
          ],
        },
        {
          heading: "Category",
          items: [
            {
              label: "Engagement",
              href: "/ring-studio/setting?category=engagement",
              icon: <RingStyleMaskIcon name="halo" size={22} />,
            },
          ],
        },
      ],
    },
    {
      heading: "Shop rings by shape",
      items: RING_SHAPES,
      more: { label: "Browse all diamonds", href: "/diamonds" },
    },
    {
      heading: "Shop rings by style",
      items: RING_STYLES,
    },
    {
      heading: "Shop rings by metal",
      items: RING_METALS,
    },
  ],
  promos: [
    {
      eyebrow: "RINGS",
      cta: { label: "Shop now", href: "/ring-studio/setting" },
    },
  ],
  footer: {
    heading: "Education",
    items: [
      { label: "Ring guide", href: "/ring-studio/setting" },
      { label: "Ring sizing", href: "/ring-studio/setting" },
      { label: "Choosing a setting", href: "/ring-studio/setting" },
      { label: "Metal guide", href: "/ring-studio/setting" },
    ],
    more: { label: "All ring guides", href: "/ring-studio/setting" },
  },
};

const NAV_ITEMS: NavItem[] = [
  { href: "/diamonds", label: "Diamonds", menu: DIAMONDS_MENU },
  { href: "/color-diamonds", label: "Fancy Diamonds", menu: COLORED_MENU },
  { href: "/gemstones", label: "Gemstones", menu: GEMSTONES_MENU },
  { href: "/ring-studio/setting?category=engagement", label: "Rings", menu: ENGAGEMENT_MENU },
];

const DARK_HERO_PATHS = new Set<string>(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
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
    setMobileOpen(false);
    setExpandedMobileItem(null);
  }, [pathname]);

  const onCartClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("estrella:open-cart"));
    }
  };

  // Mega-menu open forces the header into its solid-white "scrolled" state
  // even on the dark-hero homepage, so the dropdown panel reads cleanly.
  const onDarkHero =
    DARK_HERO_PATHS.has(pathname || "/") && !scrolled && !openMenu && !mobileOpen;
  const fg = onDarkHero ? "#ffffff" : "var(--brand-text-primary)";
  const headerSolid = scrolled || !!openMenu || mobileOpen;

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
          backgroundColor: openMenu || mobileOpen
            ? "var(--brand-bg)"
            : headerSolid
              ? "var(--glass-bg)"
              : "transparent",
          backdropFilter: headerSolid && !openMenu && !mobileOpen ? "blur(var(--glass-blur))" : "none",
          WebkitBackdropFilter:
            headerSolid && !openMenu && !mobileOpen ? "blur(var(--glass-blur))" : "none",
          borderBottom: headerSolid
            ? "1px solid var(--glass-border)"
            : "1px solid transparent",
        }}
      >
        <div
          className="estrella-container flex items-center justify-between"
          style={{ height: 75, paddingInline: 32 }}
        >
          <Link
            href="/"
            aria-label="Astreylla — home"
            style={{
              display: "inline-flex",
              alignItems: "flex-start",
              textDecoration: "none",
              paddingTop: "6px",
              height: "100%",
            }}
          >
            <img
              src={
                (onDarkHero && !mobileOpen) || theme === "dark"
                  ? "/logo/logo-dark.png"
                  : "/logo/logo-light.png"
              }
              alt="Astreylla"
              className="h-[75px] md:h-[90px] w-auto max-w-[220px] md:max-w-[280px] block"
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
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: fg,
                    textShadow: onDarkHero ? "0 1px 8px rgba(0,0,0,0.35)" : "none",
                    transition: "color 200ms ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    height: 75,
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

            {/* Localization — country/currency dropdown selector */}
            <CountrySelector fg={fg} />

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
            paddingTop: 75,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 24px 60px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <nav aria-label="Mobile" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {NAV_ITEMS.map((l) => (
                <div
                  key={l.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                    paddingBottom: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedMobileItem(expandedMobileItem === l.label ? null : l.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 26,
                        letterSpacing: "0.02em",
                        color: "var(--brand-text-primary)",
                      }}
                    >
                      {l.label}
                    </span>
                    {l.menu && (
                      <ChevronDown
                        size={22}
                        strokeWidth={1.5}
                        style={{
                          transform: expandedMobileItem === l.label ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 250ms ease",
                          color: "var(--brand-text-primary)",
                        }}
                      />
                    )}
                  </button>

                  {l.menu && expandedMobileItem === l.label && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        paddingLeft: "12px",
                        marginTop: "16px",
                        borderLeft: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                      }}
                    >
                      {/* Parent CTA: Shop All */}
                      <Link
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "var(--brand-text-primary)",
                          textDecoration: "none",
                          paddingBottom: "8px",
                          borderBottom: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Shop All {l.label}</span>
                        <span style={{ fontSize: "12px" }}>→</span>
                      </Link>

                      {l.menu.columns.map((col, colIdx) => (
                        <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {col.heading && (
                            <h4
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "var(--brand-text-muted, #7a7a7a)",
                                marginBottom: "4px",
                              }}
                            >
                              {col.heading}
                            </h4>
                          )}

                          {col.items && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {col.items.map((item, itemIdx) => (
                                <Link
                                  key={itemIdx}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    fontFamily: "var(--font-sans)",
                                    fontSize: "15px",
                                    color: "var(--brand-text-secondary)",
                                    textDecoration: "none",
                                  }}
                                >
                                  {item.icon && (
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "24px",
                                        height: "24px",
                                        color: "var(--brand-text-primary)",
                                      }}
                                    >
                                      {item.icon}
                                    </span>
                                  )}
                                  <span>{item.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}

                          {col.groups &&
                            col.groups.map((g, gIdx) => (
                              <div key={gIdx} style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                                {g.heading && (
                                  <h5
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: "var(--brand-text-secondary)",
                                      opacity: 0.8,
                                    }}
                                  >
                                    {g.heading}
                                  </h5>
                                )}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {g.items.map((item, itemIdx) => (
                                    <Link
                                      key={itemIdx}
                                      href={item.href}
                                      onClick={() => setMobileOpen(false)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        fontFamily: "var(--font-sans)",
                                        fontSize: "15px",
                                        color: "var(--brand-text-secondary)",
                                        textDecoration: "none",
                                        paddingLeft: g.heading ? "8px" : "0px",
                                      }}
                                    >
                                      {item.icon && (
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "24px",
                                            height: "24px",
                                            color: "var(--brand-text-primary)",
                                          }}
                                        >
                                          {item.icon}
                                        </span>
                                      )}
                                      <span>{item.label}</span>
                                    </Link>
                                  ))}
                                </div>
                                {g.more && (
                                  <Link
                                    href={g.more.href}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: "13px",
                                      color: "var(--brand-text-primary)",
                                      textDecoration: "underline",
                                      textUnderlineOffset: "3px",
                                      paddingLeft: g.heading ? "8px" : "0px",
                                    }}
                                  >
                                    {g.more.label} →
                                  </Link>
                                )}
                              </div>
                            ))}

                          {col.more && (
                            <Link
                              href={col.more.href}
                              onClick={() => setMobileOpen(false)}
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "13px",
                                color: "var(--brand-text-primary)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                              }}
                            >
                              {col.more.label} →
                            </Link>
                          )}
                        </div>
                      ))}

                      {/* Promo section */}
                      {l.menu.promos && l.menu.promos.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                          {l.menu.promos.map((promo, pIdx) => (
                            <Link
                              key={pIdx}
                              href={promo.cta.href}
                              onClick={() => setMobileOpen(false)}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                                padding: "16px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, var(--brand-bg-warm, #f5efe6) 0%, var(--brand-bg, #fbf8f3) 100%)",
                                border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                                textDecoration: "none",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  letterSpacing: "0.12em",
                                  color: "var(--brand-text-muted, #7a7a7a)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {promo.eyebrow}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  color: "var(--brand-text-primary)",
                                  textDecoration: "underline",
                                  textUnderlineOffset: "2px",
                                }}
                              >
                                {promo.cta.label} →
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Education footer row in mobile */}
                      {l.menu.footer && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            paddingTop: "16px",
                            marginTop: "8px",
                            borderTop: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.06))",
                          }}
                        >
                          <h4
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "11px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "var(--brand-text-muted, #7a7a7a)",
                            }}
                          >
                            {l.menu.footer.heading}
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {l.menu.footer.items.map((fItem, fIdx) => (
                              <Link
                                key={fIdx}
                                href={fItem.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "14px",
                                  color: "var(--brand-text-secondary)",
                                  textDecoration: "none",
                                }}
                              >
                                {fItem.label}
                              </Link>
                            ))}
                          </div>
                          {l.menu.footer.more && (
                            <Link
                              href={l.menu.footer.more.href}
                              onClick={() => setMobileOpen(false)}
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "13px",
                                color: "var(--brand-text-primary)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                              }}
                            >
                              {l.menu.footer.more.label} →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                margin: "12px 0 8px",
              }}
            />

            {/* Quick Actions Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Region and Currency */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--brand-text-muted, #7a7a7a)",
                  }}
                >
                  Region & Currency
                </span>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CountrySelector fg="var(--brand-text-primary)" align="left" />
                </div>
              </div>

              {/* Theme Settings */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--brand-text-muted, #7a7a7a)",
                  }}
                >
                  Theme
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => theme === "dark" && toggleTheme()}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "light" ? "var(--brand-text-primary)" : "var(--brand-border-subtle)"}`,
                      background: theme === "light" ? "var(--brand-text-primary)" : "transparent",
                      color: theme === "light" ? "var(--brand-bg)" : "var(--brand-text-primary)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                  >
                    <Sun size={16} strokeWidth={1.5} />
                    <span>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => theme === "light" && toggleTheme()}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "dark" ? "var(--brand-text-primary)" : "var(--brand-border-subtle)"}`,
                      background: theme === "dark" ? "var(--brand-text-primary)" : "transparent",
                      color: theme === "dark" ? "var(--brand-bg)" : "var(--brand-text-primary)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                  >
                    <Moon size={16} strokeWidth={1.5} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onCartClick();
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                    background: "transparent",
                    color: "var(--brand-text-primary)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "opacity 150ms ease",
                  }}
                  className="hover:opacity-75"
                >
                  <span>Cart ({cartCount > 99 ? "99+" : cartCount})</span>
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--brand-border-subtle, rgba(0,0,0,0.08))",
                    background: "transparent",
                    color: "var(--brand-text-primary)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "opacity 150ms ease",
                  }}
                  className="hover:opacity-75"
                >
                  <Search size={16} strokeWidth={1.5} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
