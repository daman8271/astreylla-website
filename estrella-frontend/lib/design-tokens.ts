export const tokens = {
  color: {
    bg: "#ffffff",
    bgWarm: "#faf6ee",
    bgSection: "#f7f6f3",
    inkPrimary: "#1a1a1a",
    inkSecondary: "#5a5a5a",
    inkMuted: "#9b9b9b",
    accentGold: "#c9a961",
    accentRed: "#e63946",
    borderSubtle: "#e5e5e5",
    borderStrong: "#1a1a1a",
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.72)",
    border: "rgba(0, 0, 0, 0.06)",
    blur: "24px",
  },
  fontSize: {
    display: 64,
    h1: 48,
    h2: 36,
    h3: 24,
    bodyLg: 18,
    body: 16,
    small: 14,
    micro: 12,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    pill: 9999,
  },
  layout: {
    maxContentWidth: 1440,
  },
} as const;

export const SHAPES = ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear"] as const;
export type Shape = (typeof SHAPES)[number];
