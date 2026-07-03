// Akoirah / Bunny CDN jewelry catalog helper.
//
// Source of truth: data/akoirah-catalog.json — auto-generated from the Bunny
// storage-zone FTP listing (see scripts/akoirah-catalog note in README). Each
// product folder holds, per metal (RG/WG/YG), a set of studio views
// (PV/FV/RV/TV), one on-hand lifestyle shot (MV) and one 360° spin .mp4.
//
// This module turns that raw listing into ready-to-use absolute CDN URLs.
import rawCatalog from "@/data/akoirah-catalog.json";

export type MetalCode = "RG" | "WG" | "YG";

export type AkoMetal = {
  main: string | null; // MV — on-hand lifestyle shot
  video: string | null; // 360° spin .mp4
  stills: string[];
  card: string | null; // PV — perspective/angled catalog shot (set by catalog generator)
  gallery: string[]; // ordered: product views first, lifestyle last
};

export type AkoProduct = {
  id: string;
  category: string;
  categoryCode: string;
  akoId: string | null;
  cdiRef: string | null;
  bunnyFolder: string;
  assetBase: string;
  cdnOk: boolean;
  cdnCode: number | null;
  metalCodes: string[];
  metals: Partial<Record<MetalCode, AkoMetal>>;
  images: string[];
  videos: string[];
};

type Catalog = {
  generatedAt: string;
  cdnBase: string;
  counts: { total: number; byCategory: Record<string, number> };
  cdnFailed: string[];
  products: AkoProduct[];
};

const catalog = rawCatalog as unknown as Catalog;

/** Public pull-zone base. Falls back to the literal host if the env is unset. */
export const BUNNY_CDN =
  process.env.NEXT_PUBLIC_BUNNY_CDN || catalog.cdnBase || "https://akoirah-live.b-cdn.net";

/** Build an absolute CDN URL, encoding each path segment (folder names are safe but be defensive). */
export function cdnUrl(assetBase: string, file: string): string {
  const base = assetBase.split("/").map(encodeURIComponent).join("/");
  return `${BUNNY_CDN}/${base}/${encodeURIComponent(file)}`;
}

export const ALL_PRODUCTS: AkoProduct[] = catalog.products;

/** Only products whose images are actually reachable on the pull zone. */
export const USABLE_PRODUCTS: AkoProduct[] = catalog.products.filter((p) => p.cdnOk);

/** Reachable rings, in stable catalog order — the pool the Ring Studio draws from. */
export const RINGS: AkoProduct[] = USABLE_PRODUCTS.filter((p) => p.categoryCode === "RN");

export function getProductById(id: string): AkoProduct | undefined {
  return catalog.products.find((p) => p.id === id);
}

/** Setting metal-colour name -> Bunny metal code. Platinum has no render -> use white gold. */
export const COLOR_TO_METAL: Record<string, MetalCode> = {
  Rose: "RG",
  White: "WG",
  Yellow: "YG",
  Platinum: "WG",
};

/** Pick the metal block for a colour, falling back to the product's first available metal. */
function metalFor(product: AkoProduct, color: string): AkoMetal | null {
  const code = COLOR_TO_METAL[color] ?? "WG";
  const m = product.metals[code] ?? product.metals[(product.metalCodes[0] as MetalCode) || "WG"];
  return m ?? null;
}

export type ResolvedMedia = {
  card: string | null; // PV — perspective/angled catalog card image (absolute URL)
  topView: string | null; // TV — top-down/overhead diamond view (absolute URL)
  frontView: string | null; // FV — front view of ring (absolute URL)
  hero: string | null; // detail hero still (absolute URL)
  lifestyle: string | null; // on-hand MV shot (absolute URL)
  video: string | null; // 360° spin video (absolute URL)
  gallery: string[]; // ordered gallery (absolute URLs)
};

/** Resolve absolute CDN URLs for one product in one metal colour. */
export function resolveMedia(product: AkoProduct | undefined, color: string): ResolvedMedia {
  if (!product) return { card: null, topView: null, frontView: null, hero: null, lifestyle: null, video: null, gallery: [] };
  const m = metalFor(product, color);
  if (!m) return { card: null, topView: null, frontView: null, hero: null, lifestyle: null, video: null, gallery: [] };
  const u = (f: string | null) => (f ? cdnUrl(product.assetBase, f) : null);
  // Derive TV/FV from stills filenames (the catalog generator doesn't expose them as dedicated fields).
  const tvFile = m.stills.find((f) => /-(TV|T2V)\./i.test(f)) ?? null;
  const fvFile = m.stills.find((f) => /-FV\./i.test(f)) ?? null;
  return {
    card: u(m.card),
    topView: u(tvFile),
    frontView: u(fvFile),
    hero: u(m.card ?? m.main),
    lifestyle: u(m.main),
    video: u(m.video),
    gallery: m.gallery.map((f) => cdnUrl(product.assetBase, f)),
  };
}
