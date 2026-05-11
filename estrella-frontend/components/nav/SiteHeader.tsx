"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Moon, Sun, Search, ChevronDown } from "lucide-react";
import { MegaMenu, type MegaMenuConfig, type MegaMenuItem } from "./MegaMenu";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  RoundIcon,
  PrincessIcon,
  OvalIcon,
  RadiantIcon,
  PearIcon,
  HeartIcon,
  MarquiseIcon,
  EmeraldIcon,
} from "@/components/diamonds/ShapeIcons";

type NavItem = {
  href: string;
  label: string;
  menu?: MegaMenuConfig;
};

// ── ICON BUILDERS ─────────────────────────────────────────────────────────
// Reuse the existing diamond shape SVGs from ShapeIcons.tsx for shape rows.
const ShapeIcon = ({ Cmp }: { Cmp: (p: { size?: number }) => JSX.Element }) => (
  <Cmp size={20} />
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

// Tiny outline ring/icon for "Ring Studio" entries.
const RingStudioIcon = ({ which }: { which: "setting" | "diamond" | "labgrown" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    {which === "setting" ? (
      <>
        <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 9 L12 4 L15 9" stroke="currentColor" strokeWidth="1.3" />
      </>
    ) : which === "diamond" ? (
      <>
        <path
          d="M6 9 L12 3 L18 9 L12 21 Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </>
    ) : (
      <>
        <path
          d="M6 9 L12 3 L18 9 L12 21 Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeDasharray="2 1.5"
        />
      </>
    )}
  </svg>
);

// ── DIAMONDS MEGA-MENU ────────────────────────────────────────────────────
const SHAPE_ITEM = (
  label: string,
  Icon: (p: { size?: number }) => JSX.Element,
  href: string
): MegaMenuItem => ({ label, href, icon: <ShapeIcon Cmp={Icon} /> });

const DIAMOND_SHAPES_LAB: MegaMenuItem[] = [
  SHAPE_ITEM("Round", RoundIcon, "/diamonds?shape=Round&treatment=lab-grown"),
  SHAPE_ITEM("Princess", PrincessIcon, "/diamonds?shape=Princess&treatment=lab-grown"),
  SHAPE_ITEM("Oval", OvalIcon, "/diamonds?shape=Oval&treatment=lab-grown"),
  SHAPE_ITEM("Radiant", RadiantIcon, "/diamonds?shape=Radiant&treatment=lab-grown"),
  SHAPE_ITEM("Pear", PearIcon, "/diamonds?shape=Pear&treatment=lab-grown"),
  SHAPE_ITEM("Heart", HeartIcon, "/diamonds?shape=Heart&treatment=lab-grown"),
  SHAPE_ITEM("Marquise", MarquiseIcon, "/diamonds?shape=Marquise&treatment=lab-grown"),
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
              href: "/ring-studio/diamond",
              icon: <RingStudioIcon which="setting" />,
            },
            {
              label: "Start with a diamond",
              href: "/diamonds",
              icon: <RingStudioIcon which="diamond" />,
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
  SHAPE_ITEM("Round", RoundIcon, "/color-diamonds"),
  SHAPE_ITEM("Princess", PrincessIcon, "/color-diamonds"),
  SHAPE_ITEM("Oval", OvalIcon, "/color-diamonds"),
  SHAPE_ITEM("Radiant", RadiantIcon, "/color-diamonds"),
  SHAPE_ITEM("Pear", PearIcon, "/color-diamonds"),
  SHAPE_ITEM("Heart", HeartIcon, "/color-diamonds"),
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
              href: "/ring-studio/diamond",
              icon: <RingStudioIcon which="setting" />,
            },
            {
              label: "Start with a fancy diamond",
              href: "/color-diamonds",
              icon: <RingStudioIcon which="diamond" />,
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
  SHAPE_ITEM("Round", RoundIcon, "/gemstones"),
  { label: "Square", href: "/gemstones", icon: <ShapeIcon Cmp={PrincessIcon} /> },
  SHAPE_ITEM("Oval", OvalIcon, "/gemstones"),
  SHAPE_ITEM("Emerald", EmeraldIcon, "/gemstones"),
  SHAPE_ITEM("Pear", PearIcon, "/gemstones"),
  SHAPE_ITEM("Heart", HeartIcon, "/gemstones"),
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
  SHAPE_ITEM("Round", RoundIcon, "/ring-studio/diamond"),
  SHAPE_ITEM("Princess", PrincessIcon, "/ring-studio/diamond"),
  SHAPE_ITEM("Oval", OvalIcon, "/ring-studio/diamond"),
  SHAPE_ITEM("Radiant", RadiantIcon, "/ring-studio/diamond"),
  SHAPE_ITEM("Pear", PearIcon, "/ring-studio/diamond"),
  SHAPE_ITEM("Heart", HeartIcon, "/ring-studio/diamond"),
];

const RingStyleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const RING_STYLES: MegaMenuItem[] = [
  { label: "Solitaire", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Pave", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Halo", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Hidden Halo", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Nature", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Trilogy", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
  { label: "Vintage", href: "/ring-studio/diamond", icon: <RingStyleIcon /> },
];

const RING_METALS: MegaMenuItem[] = [
  {
    label: "14k Yellow Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#f1d27a" fg="#7a5b1a" text="14K" />,
  },
  {
    label: "18k Yellow Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#e9c25a" fg="#5a4112" text="18K" />,
  },
  {
    label: "14k Rose Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#eac0b0" fg="#7a3f2c" text="14K" />,
  },
  {
    label: "18k Rose Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#dba38e" fg="#5e2d1d" text="18K" />,
  },
  {
    label: "14k White Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#e8e6e0" fg="#3d3d3d" text="14K" border="#cfcdc7" />,
  },
  {
    label: "18k White Gold",
    href: "/ring-studio/diamond",
    icon: <MetalChip bg="#dcdad4" fg="#2c2c2c" text="18K" border="#bfbdb7" />,
  },
  {
    label: "950 Platinum",
    href: "/ring-studio/diamond",
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
              href: "/ring-studio/diamond",
              icon: <RingStudioIcon which="setting" />,
            },
            {
              label: "Start with a diamond",
              href: "/diamonds?treatment=lab-grown",
              icon: <RingStudioIcon which="labgrown" />,
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
      cta: { label: "Shop now", href: "/ring-studio/diamond" },
    },
  ],
  footer: {
    heading: "Education",
    items: [
      { label: "Ring guide", href: "/ring-studio/diamond" },
      { label: "Ring sizing", href: "/ring-studio/diamond" },
      { label: "Choosing a setting", href: "/ring-studio/diamond" },
      { label: "Metal guide", href: "/ring-studio/diamond" },
    ],
    more: { label: "All ring guides", href: "/ring-studio/diamond" },
  },
};

const NAV_ITEMS: NavItem[] = [
  { href: "/diamonds", label: "Diamonds", menu: DIAMONDS_MENU },
  { href: "/color-diamonds", label: "Fancy Diamonds", menu: COLORED_MENU },
  { href: "/gemstones", label: "Gemstones", menu: GEMSTONES_MENU },
  { href: "/ring-studio/diamond", label: "Rings", menu: ENGAGEMENT_MENU },
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
            ? "var(--brand-bg)"
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
          style={{ height: 75, paddingInline: 32 }}
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

            {/* Localization button — Aria parity: 48×44, 12px Instrument Sans,
                20×20 flag swatch, white on dark hero / primary text on light. */}
            <button
              type="button"
              aria-label="Localization"
              className="hover:opacity-70 transition-opacity"
              style={{
                background: "transparent",
                border: 0,
                color: fg,
                width: 48,
                height: 44,
                padding: 0,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  overflow: "hidden",
                  fontSize: 20,
                  lineHeight: "20px",
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                🇺🇸
              </span>
              <span className="currency-country" style={{ fontSize: 12 }}>US</span>
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
