import type { Setting, SettingStyle, SettingMetal } from "@/components/ring-studio/setting-types";

const PALETTE: Record<string, { bg: string; fg: string }> = {
  Rose: { bg: "e3b8a4", fg: "5a3328" },
  White: { bg: "dadada", fg: "333333" },
  Yellow: { bg: "d8b76a", fg: "3a2a06" },
  Platinum: { bg: "c8ccd0", fg: "1f2933" },
};

function mockImage(name: string, color: keyof typeof PALETTE) {
  const p = PALETTE[color];
  const text = encodeURIComponent(name);
  return `https://placehold.co/800x800/${p.bg}/${p.fg}?text=${text}`;
}

function buildMetals(name: string, basePrices: Record<string, number>): SettingMetal[] {
  const tag = (k: string, c: keyof typeof PALETTE) => `${name}\n${k} ${c}`;
  return [
    { karat: "9K", color: "Rose", priceUsd: basePrices["9K"] ?? 850, imageUrl: mockImage(tag("9K", "Rose"), "Rose") },
    { karat: "14K", color: "Rose", priceUsd: basePrices["14K"] ?? 1150, imageUrl: mockImage(tag("14K", "Rose"), "Rose") },
    { karat: "18K", color: "Rose", priceUsd: basePrices["18K"] ?? 1400, imageUrl: mockImage(tag("18K", "Rose"), "Rose") },
    { karat: "9K", color: "White", priceUsd: basePrices["9K"] ?? 850, imageUrl: mockImage(tag("9K", "White"), "White") },
    { karat: "14K", color: "White", priceUsd: basePrices["14K"] ?? 1150, imageUrl: mockImage(tag("14K", "White"), "White") },
    { karat: "18K", color: "White", priceUsd: basePrices["18K"] ?? 1400, imageUrl: mockImage(tag("18K", "White"), "White") },
    { karat: "14K", color: "Yellow", priceUsd: basePrices["14K"] ?? 1150, imageUrl: mockImage(tag("14K", "Yellow"), "Yellow") },
    { karat: "18K", color: "Yellow", priceUsd: basePrices["18K"] ?? 1400, imageUrl: mockImage(tag("18K", "Yellow"), "Yellow") },
    { karat: "PT", color: "Platinum", priceUsd: basePrices["PT"] ?? 1750, imageUrl: mockImage(tag("PT", "Platinum"), "Platinum") },
  ];
}

const ALL_SHAPES: Setting["availableShapes"] = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Emerald",
  "Marquise",
  "Heart",
  "Asscher",
  "Radiant",
];

export const SETTINGS: Setting[] = [
  {
    sku: "AUG001-R-SOL",
    name: "The Aurora",
    style: "Solitaire",
    description: "A timeless solitaire that lets a single brilliant stone speak for itself. The slim band is hand-finished for an effortless silhouette.",
    basePriceUsd: 680,
    availableShapes: ALL_SHAPES,
    defaultThumbnail: mockImage("Aurora", "White"),
    metals: buildMetals("Aurora", { "9K": 680, "14K": 920, "18K": 1120, PT: 1480 }),
  },
  {
    sku: "AUG002-R-SOL",
    name: "The Lumen",
    style: "Solitaire",
    description: "Six delicate prongs cradle the centre stone, lifting it skyward for maximum brilliance. Pairs beautifully with any wedding band.",
    basePriceUsd: 720,
    availableShapes: ALL_SHAPES,
    defaultThumbnail: mockImage("Lumen", "Yellow"),
    metals: buildMetals("Lumen", { "9K": 720, "14K": 980, "18K": 1180, PT: 1520 }),
  },
  {
    sku: "AUG003-R-HAL",
    name: "The Floral",
    style: "Halo",
    description: "A petal-shaped halo of pavé diamonds blossoms around the centre stone, amplifying its radiance for a romantic finish.",
    basePriceUsd: 1090,
    availableShapes: ["Round", "Oval", "Cushion", "Pear", "Emerald"],
    defaultThumbnail: mockImage("Floral", "Rose"),
    metals: buildMetals("Floral", { "9K": 1090, "14K": 1340, "18K": 1620, PT: 1990 }),
  },
  {
    sku: "AUG004-R-HAL",
    name: "The Celeste",
    style: "Halo",
    description: "A classic round halo magnifies the centre stone with a perfect symmetrical glow. Pavé shoulders trail toward the band.",
    basePriceUsd: 1240,
    availableShapes: ["Round", "Princess", "Oval", "Cushion"],
    defaultThumbnail: mockImage("Celeste", "White"),
    metals: buildMetals("Celeste", { "9K": 1240, "14K": 1490, "18K": 1790, PT: 2190 }),
  },
  {
    sku: "AUG005-R-HHL",
    name: "The Vela",
    style: "Hidden Halo",
    description: "From above, a clean solitaire silhouette. Tilt and a hidden halo of micro-pavé reveals itself for an unexpected sparkle.",
    basePriceUsd: 1180,
    availableShapes: ["Round", "Oval", "Cushion", "Emerald", "Radiant"],
    defaultThumbnail: mockImage("Vela", "Yellow"),
    metals: buildMetals("Vela", { "9K": 1180, "14K": 1420, "18K": 1720, PT: 2090 }),
  },
  {
    sku: "AUG006-R-PAV",
    name: "The Étoile",
    style: "Pave",
    description: "Tightly-set pavé runs the entire length of the band, surrounding the centre stone in continuous fire from every angle.",
    basePriceUsd: 1150,
    availableShapes: ["Round", "Princess", "Oval", "Cushion", "Pear"],
    defaultThumbnail: mockImage("Etoile", "Rose"),
    metals: buildMetals("Étoile", { "9K": 1150, "14K": 1390, "18K": 1690, PT: 2050 }),
  },
  {
    sku: "AUG007-R-PAV",
    name: "The Sirena",
    style: "Pave",
    description: "A delicate twisted band hand-set with pavé diamonds along its curve. Modern and feminine without being overdone.",
    basePriceUsd: 980,
    availableShapes: ["Round", "Oval", "Pear", "Marquise"],
    defaultThumbnail: mockImage("Sirena", "White"),
    metals: buildMetals("Sirena", { "9K": 980, "14K": 1220, "18K": 1490, PT: 1820 }),
  },
  {
    sku: "AUG008-R-1ST",
    name: "The Accent",
    style: "Side Stone",
    description: "Designed with side stones that gracefully complement the centre stone, this ring strikes a balance between classic elegance and added brilliance.",
    basePriceUsd: 1240,
    availableShapes: ["Round", "Oval", "Cushion", "Pear", "Emerald", "Princess"],
    defaultThumbnail: mockImage("Accent", "Rose"),
    metals: buildMetals("Accent", { "9K": 1240, "14K": 1490, "18K": 1790, PT: 2190 }),
  },
  {
    sku: "AUG009-R-3ST",
    name: "The Triad",
    style: "Three-Stone",
    description: "Past, present, future — a centre stone flanked by two perfectly-matched side stones. Symbolic without being heavy.",
    basePriceUsd: 1490,
    availableShapes: ["Round", "Oval", "Emerald", "Cushion"],
    defaultThumbnail: mockImage("Triad", "Yellow"),
    metals: buildMetals("Triad", { "9K": 1490, "14K": 1790, "18K": 2150, PT: 2580 }),
  },
  {
    sku: "AUG010-R-NAT",
    name: "The Verdant",
    style: "Nature",
    description: "Twin vines of pavé curl up the band and meet beneath the centre stone, evoking organic growth in solid gold.",
    basePriceUsd: 1320,
    availableShapes: ["Round", "Oval", "Pear", "Marquise"],
    defaultThumbnail: mockImage("Verdant", "Rose"),
    metals: buildMetals("Verdant", { "9K": 1320, "14K": 1590, "18K": 1920, PT: 2350 }),
  },
];

export function getSettingBySku(sku: string): Setting | undefined {
  return SETTINGS.find((s) => s.sku === sku);
}

export function listSettingsByStyle(style?: SettingStyle): Setting[] {
  if (!style) return SETTINGS;
  return SETTINGS.filter((s) => s.style === style);
}

export function filterSettings(opts: {
  shape?: string | null;
  styles?: Set<SettingStyle>;
  metalKeys?: Set<string>;
  priceMin?: number;
  priceMax?: number;
}): Setting[] {
  return SETTINGS.filter((s) => {
    if (opts.shape && !s.availableShapes.some((sh) => sh.toLowerCase() === opts.shape!.toLowerCase())) {
      return false;
    }
    if (opts.styles && opts.styles.size > 0 && !opts.styles.has(s.style)) {
      return false;
    }
    if (opts.metalKeys && opts.metalKeys.size > 0) {
      const hasMatch = s.metals.some((m) => opts.metalKeys!.has(`${m.karat}-${m.color}`));
      if (!hasMatch) return false;
    }
    if (opts.priceMin != null && s.basePriceUsd < opts.priceMin) return false;
    if (opts.priceMax != null && s.basePriceUsd > opts.priceMax) return false;
    return true;
  });
}

export function formatUsd(amount: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}
