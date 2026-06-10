export type Diamond = {
  id: string;
  stockNum?: string;
  carat: number;
  price: number;
  shape?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  lab?: string; // certificate authority (GIA/IGI/HRD) — NOT treatment
  measurements?: string;
  pricePerCarat?: number;
  image_url?: string;
  video_url?: string;
  available?: boolean;
  title?: string; // server-formatted display title
  fancyColor?: string;
  fancyColorIntensity?: string;
  fancyColorOvertone?: string;
};

export type DiamondsResponse = {
  diamonds?: Diamond[];
  data?: Diamond[];
  pagination?: { from?: number; to?: number; hasMore?: boolean };
  totalCount?: number;
  count?: number;
  currencyCode?: string;
};

export type Treatment = "lab-grown" | "natural" | "";

export type SortKey =
  | "price-asc"
  | "price-desc"
  | "carat-asc"
  | "carat-desc"
  | "";

export const SHAPES_PRIMARY = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
] as const;

export const SHAPES_MORE = [
  "Emerald",
  "Marquise",
  "Heart",
  "Asscher",
  "Radiant",
] as const;

// Order used by the colour slider. Lower index = closer to D (best). Display
// order in the screenshot is H → D (left → right) so we render the array
// reversed; internally we keep D-first to match Augmont's natural ordering.
export const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K"] as const;

// Clarity ordered worst → best (matches slider screenshot left → right).
export const CLARITIES = [
  "VS2",
  "VS1",
  "VVS2",
  "VVS1",
  "IF",
  "FL",
] as const;

// Cut grade order. Screenshot shows "Very Good / Excellent / Ideal" — Augmont
// returns "Excellent / Very Good / Good / Fair", so "Ideal" is mapped to
// "Excellent" upstream when the slider sits at the top.
export const CUTS = ["Very Good", "Excellent", "Ideal"] as const;

export const CARAT_MIN = 0.1;
export const CARAT_MAX = 10;
export const PRICE_MIN = 1;
export const PRICE_MAX = 10000;
