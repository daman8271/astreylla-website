import type { SHAPES_PRIMARY, SHAPES_MORE } from "@/components/diamonds/types";

export type SettingStyle =
  | "Solitaire"
  | "Halo"
  | "Hidden Halo"
  | "Pave"
  | "Side Stone"
  | "Three-Stone"
  | "Nature";

export const SETTING_STYLES: SettingStyle[] = [
  "Halo",
  "Hidden Halo",
  "Nature",
  "Pave",
  "Side Stone",
  "Solitaire",
  "Three-Stone",
];

export type SettingKarat = "9K" | "14K" | "18K" | "PT";
export type SettingColor = "Rose" | "White" | "Yellow" | "Platinum";

export type Shape = (typeof SHAPES_PRIMARY)[number] | (typeof SHAPES_MORE)[number];

export type SettingMetal = {
  karat: SettingKarat;
  color: SettingColor;
  priceUsd: number;
  imageUrl: string;
  thumbnails?: string[];
  gallery360?: string[];
  /** 360° spin video (Bunny CDN .mp4) for this metal, when available. */
  videoUrl?: string;
};

export type Setting = {
  sku: string;
  name: string;
  style: SettingStyle;
  description: string;
  basePriceUsd: number;
  availableShapes: Shape[];
  metals: SettingMetal[];
  defaultThumbnail: string;
  videoUrl?: string;
};

export function metalKey(m: { karat: SettingKarat; color: SettingColor }): string {
  return `${m.karat}-${m.color}`;
}

export function metalLabel(m: { karat: SettingKarat; color: SettingColor }): string {
  return `${m.karat} ${m.color} Gold`.replace("Platinum Gold", "Platinum");
}
