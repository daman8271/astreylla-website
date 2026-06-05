import type { Setting, SettingStyle, SettingMetal, Shape } from "@/components/ring-studio/setting-types";
import { RINGS, resolveMedia, type AkoProduct, ALL_PRODUCTS } from "@/lib/akoirah";
import crmData from "@/data/orior-data.json";

const PALETTE: Record<string, { bg: string; fg: string }> = {
  Rose: { bg: "e3b8a4", fg: "5a3328" },
  White: { bg: "dadada", fg: "333333" },
  Yellow: { bg: "d8b76a", fg: "3a2a06" },
  Platinum: { bg: "c8ccd0", fg: "1f2933" },
};

// Last-resort placeholder, used only when a setting has no mapped Bunny render
// (e.g. we run out of usable ring folders, or the CDN is unreachable).
function mockImage(name: string, color: keyof typeof PALETTE) {
  const p = PALETTE[color];
  const text = encodeURIComponent(name);
  return `https://placehold.co/800x800/${p.bg}/${p.fg}?text=${text}`;
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

// The 9 metal/karat variants every setting offers. Image + video come from the
// mapped Bunny ring (per colour: Rose->RG, White->WG, Yellow->YG, Platinum->WG).
const METAL_SPECS: { karat: SettingMetal["karat"]; color: SettingMetal["color"]; priceKey: string }[] = [
  { karat: "9K", color: "Rose", priceKey: "9K" },
  { karat: "14K", color: "Rose", priceKey: "14K" },
  { karat: "18K", color: "Rose", priceKey: "18K" },
  { karat: "9K", color: "White", priceKey: "9K" },
  { karat: "14K", color: "White", priceKey: "14K" },
  { karat: "18K", color: "White", priceKey: "18K" },
  { karat: "14K", color: "Yellow", priceKey: "14K" },
  { karat: "18K", color: "Yellow", priceKey: "18K" },
  { karat: "PT", color: "Platinum", priceKey: "PT" },
];

type SettingSeed = {
  sku: string;
  name: string;
  style: SettingStyle;
  description: string;
  basePriceUsd: number;
  availableShapes: Setting["availableShapes"];
  prices: Record<string, number>;
};

// Curated catalogue metadata (names, styles, descriptions, prices). Imagery is
// overlaid from the Bunny CDN catalogue below.
// NOTE: these Bunny renders are finished fashion rings, not engagement-ring
// mountings — the image<->setting pairing is approximate and 1:1 by catalogue
// order. Precise product identity/style/pricing arrives with the Ring API.
// TODO: wire Ring API pricing + descriptions + correct image mapping — prices below are placeholder.
const SEEDS: SettingSeed[] = [
  {
    sku: "AUG001-R-SOL",
    name: "The Aurora",
    style: "Solitaire",
    description:
      "A timeless solitaire that lets a single brilliant stone speak for itself. The slim band is hand-finished for an effortless silhouette.",
    basePriceUsd: 680,
    availableShapes: ALL_SHAPES,
    prices: { "9K": 680, "14K": 920, "18K": 1120, PT: 1480 },
  },
  {
    sku: "AUG002-R-SOL",
    name: "The Lumen",
    style: "Solitaire",
    description:
      "Six delicate prongs cradle the centre stone, lifting it skyward for maximum brilliance. Pairs beautifully with any wedding band.",
    basePriceUsd: 720,
    availableShapes: ALL_SHAPES,
    prices: { "9K": 720, "14K": 980, "18K": 1180, PT: 1520 },
  },
  {
    sku: "AUG003-R-HAL",
    name: "The Floral",
    style: "Halo",
    description:
      "A petal-shaped halo of pavé diamonds blossoms around the centre stone, amplifying its radiance for a romantic finish.",
    basePriceUsd: 1090,
    availableShapes: ["Round", "Oval", "Cushion", "Pear", "Emerald"],
    prices: { "9K": 1090, "14K": 1340, "18K": 1620, PT: 1990 },
  },
  {
    sku: "AUG004-R-HAL",
    name: "The Celeste",
    style: "Halo",
    description:
      "A classic round halo magnifies the centre stone with a perfect symmetrical glow. Pavé shoulders trail toward the band.",
    basePriceUsd: 1240,
    availableShapes: ["Round", "Princess", "Oval", "Cushion"],
    prices: { "9K": 1240, "14K": 1490, "18K": 1790, PT: 2190 },
  },
  {
    sku: "AUG005-R-HHL",
    name: "The Vela",
    style: "Hidden Halo",
    description:
      "From above, a clean solitaire silhouette. Tilt and a hidden halo of micro-pavé reveals itself for an unexpected sparkle.",
    basePriceUsd: 1180,
    availableShapes: ["Round", "Oval", "Cushion", "Emerald", "Radiant"],
    prices: { "9K": 1180, "14K": 1420, "18K": 1720, PT: 2090 },
  },
  {
    sku: "AUG006-R-PAV",
    name: "The Étoile",
    style: "Pave",
    description:
      "Tightly-set pavé runs the entire length of the band, surrounding the centre stone in continuous fire from every angle.",
    basePriceUsd: 1150,
    availableShapes: ["Round", "Princess", "Oval", "Cushion", "Pear"],
    prices: { "9K": 1150, "14K": 1390, "18K": 1690, PT: 2050 },
  },
  {
    sku: "AUG007-R-PAV",
    name: "The Sirena",
    style: "Pave",
    description:
      "A delicate twisted band hand-set with pavé diamonds along its curve. Modern and feminine without being overdone.",
    basePriceUsd: 980,
    availableShapes: ["Round", "Oval", "Pear", "Marquise"],
    prices: { "9K": 980, "14K": 1220, "18K": 1490, PT: 1820 },
  },
  {
    sku: "AUG008-R-1ST",
    name: "The Accent",
    style: "Side Stone",
    description:
      "Designed with side stones that gracefully complement the centre stone, this ring strikes a balance between classic elegance and added brilliance.",
    basePriceUsd: 1240,
    availableShapes: ["Round", "Oval", "Cushion", "Pear", "Emerald", "Princess"],
    prices: { "9K": 1240, "14K": 1490, "18K": 1790, PT: 2190 },
  },
  {
    sku: "AUG009-R-3ST",
    name: "The Triad",
    style: "Three-Stone",
    description:
      "Past, present, future — a centre stone flanked by two perfectly-matched side stones. Symbolic without being heavy.",
    basePriceUsd: 1490,
    availableShapes: ["Round", "Oval", "Emerald", "Cushion"],
    prices: { "9K": 1490, "14K": 1790, "18K": 2150, PT: 2580 },
  },
  {
    sku: "AUG010-R-NAT",
    name: "The Verdant",
    style: "Nature",
    description:
      "Twin vines of pavé curl up the band and meet beneath the centre stone, evoking organic growth in solid gold.",
    basePriceUsd: 1320,
    availableShapes: ["Round", "Oval", "Pear", "Marquise"],
    prices: { "9K": 1320, "14K": 1590, "18K": 1920, PT: 2350 },
  },
];

function buildSetting(seed: SettingSeed, ring: AkoProduct | undefined): Setting {
  const metals: SettingMetal[] = METAL_SPECS.map((spec) => {
    const media = resolveMedia(ring, spec.color);
    return {
      karat: spec.karat,
      color: spec.color,
      priceUsd: seed.prices[spec.priceKey] ?? seed.basePriceUsd,
      imageUrl: media.card ?? mockImage(`${seed.name}\n${spec.karat} ${spec.color}`, spec.color),
      thumbnails: media.gallery.length ? media.gallery : undefined,
      videoUrl: media.video ?? undefined,
    };
  });
  const white = resolveMedia(ring, "White");
  return {
    sku: seed.sku,
    name: seed.name,
    style: seed.style,
    description: seed.description,
    basePriceUsd: seed.basePriceUsd,
    availableShapes: seed.availableShapes,
    defaultThumbnail: white.card ?? mockImage(seed.name, "White"),
    metals,
  };
}

// Map each curated setting to a usable Bunny ring (1:1 by catalogue order).
export const SETTINGS: Setting[] = SEEDS.map((seed, i) => buildSetting(seed, RINGS[i]));

let _crmSettings: Setting[] | null = null;
function getCrmSettings(): Setting[] {
  if (_crmSettings) return _crmSettings;
  try {
    const cdnMap = new Map<string, any>();
    for (const p of ALL_PRODUCTS) {
      cdnMap.set(p.bunnyFolder, p);
    }
    _crmSettings = (crmData as any[])
      .filter((crmItem: any) => {
        const isRing = crmItem.CATEGORY?.toLowerCase() === "rings";
        const folderName = crmItem.ECOM_SKU;
        const cdnProduct = folderName ? cdnMap.get(folderName) : null;
        return isRing && cdnProduct && cdnProduct.cdnOk;
      })
      .map((crmItem: any) => {
        const folderName = crmItem.ECOM_SKU;
        const cdnProduct = cdnMap.get(folderName)!;
        return mapCrmToSetting(crmItem, cdnProduct);
      });
  } catch (e) {
    console.error("Failed to map crmData in settings.ts:", e);
    _crmSettings = [];
  }
  return _crmSettings;
}

export function getSettingBySku(sku: string): Setting | undefined {
  const staticSetting = SETTINGS.find((s) => s.sku === sku);
  if (staticSetting) return staticSetting;
  return getCrmSettings().find((s) => s.sku === sku);
}

export function listSettingsByStyle(style?: SettingStyle): Setting[] {
  if (!style) return SETTINGS;
  return SETTINGS.filter((s) => s.style === style);
}

export function filterSettings(
  opts: {
    shape?: string | null;
    shapes?: Set<string>;
    styles?: Set<SettingStyle>;
    metalKeys?: Set<string>;
    priceMin?: number;
    priceMax?: number;
  },
  settingsList: Setting[] = SETTINGS
): Setting[] {
  return settingsList.filter((s) => {
    if (opts.shape && !s.availableShapes.some((sh) => sh.toLowerCase() === opts.shape!.toLowerCase())) {
      return false;
    }
    if (opts.shapes && opts.shapes.size > 0) {
      const hasShape = s.availableShapes.some((sh) => opts.shapes!.has(sh));
      if (!hasShape) return false;
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

export function mapCrmToSetting(crmItem: any, cdnProduct: AkoProduct): Setting {
  const title = (crmItem.TITLE || "").toLowerCase();
  let style: SettingStyle = "Solitaire";
  if (title.includes("hidden halo")) {
    style = "Hidden Halo";
  } else if (title.includes("halo")) {
    style = "Halo";
  } else if (title.includes("three stone") || title.includes("three-stone") || title.includes("trio")) {
    style = "Three-Stone";
  } else if (title.includes("pave") || title.includes("pave-set")) {
    style = "Pave";
  } else if (title.includes("side stone") || title.includes("sidestone")) {
    style = "Side Stone";
  } else if (title.includes("nature") || title.includes("leaf") || title.includes("vine")) {
    style = "Nature";
  }

  const mrp18K = crmItem.APPROX_MRP_LIST?.find((x: any) => x.KT === "18KT")?.MRP;
  const mrp14K = crmItem.APPROX_MRP_LIST?.find((x: any) => x.KT === "14KT")?.MRP;
  const baseMrp = mrp18K || mrp14K || crmItem.APPROX_MRP_LIST?.[0]?.MRP || 0;
  const basePriceUsd = Math.round(baseMrp / 83.5);

  const shapeStr = crmItem.SHAPE || "Round";
  const shapeMap: Record<string, Shape> = {
    "round": "Round",
    "oval": "Oval",
    "pear": "Pear",
    "emerald": "Emerald",
    "cushion": "Cushion",
    "marquise": "Marquise",
    "radiant": "Radiant",
    "princess": "Princess",
    "heart": "Heart",
    "asscher": "Asscher",
  };
  const mappedShape = shapeMap[shapeStr.toLowerCase()] || "Round";
  const availableShapes: Shape[] = [mappedShape];

  const metals: SettingMetal[] = [];
  const metalColors: Array<{ color: "Rose" | "White" | "Yellow"; key: "RG" | "WG" | "YG" }> = [
    { color: "White", key: "WG" },
    { color: "Yellow", key: "YG" },
    { color: "Rose", key: "RG" }
  ];

  for (const mc of metalColors) {
    if (cdnProduct.metalCodes.includes(mc.key)) {
      const media = resolveMedia(cdnProduct, mc.color);
      const karatList = crmItem.APPROX_MRP_LIST || [];
      const karat = karatList.find((x: any) => x.KT === "18KT") ? "18K" : (karatList.find((x: any) => x.KT === "14KT") ? "14K" : "18K");
      const mrp = karatList.find((x: any) => x.KT === (karat + "T"))?.MRP || baseMrp;
      const priceUsd = Math.round(mrp / 83.5);

      metals.push({
        karat: karat as any,
        color: mc.color,
        priceUsd,
        imageUrl: media.card || media.lifestyle || "",
        thumbnails: media.gallery.length ? media.gallery : undefined,
        videoUrl: media.video || undefined,
      });
    }
  }

  if (metals.length === 0) {
    const media = resolveMedia(cdnProduct, "White");
    metals.push({
      karat: "18K",
      color: "White",
      priceUsd: basePriceUsd,
      imageUrl: media.card || media.lifestyle || "",
      thumbnails: media.gallery.length ? media.gallery : undefined,
      videoUrl: media.video || undefined,
    });
  }

  const whiteMedia = resolveMedia(cdnProduct, "White");
  const defaultThumbnail = whiteMedia.card || whiteMedia.lifestyle || metals[0]?.imageUrl || "";

  return {
    sku: crmItem.SKU,
    name: crmItem.TITLE,
    style,
    description: crmItem.DESCRIPTION || crmItem.POST_CONTENT || "",
    basePriceUsd,
    availableShapes,
    metals,
    defaultThumbnail,
    videoUrl: whiteMedia.video || undefined,
  };
}
