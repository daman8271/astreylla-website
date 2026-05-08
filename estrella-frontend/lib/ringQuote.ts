import type { Diamond } from "@/components/diamonds/types";
import type { Setting, SettingMetal, SettingStyle } from "@/components/ring-studio/setting-types";
import type { RegionCode } from "./ringSizes";

export type RingQuotePayload = {
  v: 1;
  createdAt: string;
  diamond: {
    stockNum: string;
    carats: number;
    color?: string;
    clarity?: string;
    cut?: string;
    shape?: string;
    priceUsd: number;
    imageUrl?: string;
  };
  setting: {
    sku: string;
    name: string;
    style: SettingStyle;
    metal: { karat: SettingMetal["karat"]; color: SettingMetal["color"] };
    shape: string;
    priceUsd: number;
    imageUrl: string;
  };
  size: { region: RegionCode; label: string; value: string };
  totalUsd: number;
  customer?: { email?: string; firstName?: string; lastName?: string };
};

export function buildRingQuotePayload(input: {
  diamond: Diamond;
  setting: Setting;
  metal: SettingMetal;
  shape: string;
  region: RegionCode;
  size: { label: string; value: string };
}): RingQuotePayload {
  const { diamond, setting, metal, shape, region, size } = input;
  return {
    v: 1,
    createdAt: new Date().toISOString(),
    diamond: {
      stockNum: diamond.stockNum || diamond.id,
      carats: Number(diamond.carat || 0),
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      shape: diamond.shape,
      priceUsd: Number(diamond.price || 0),
      imageUrl: diamond.image_url,
    },
    setting: {
      sku: setting.sku,
      name: setting.name,
      style: setting.style,
      metal: { karat: metal.karat, color: metal.color },
      shape,
      priceUsd: metal.priceUsd,
      imageUrl: metal.imageUrl,
    },
    size: { region, label: size.label, value: size.value },
    totalUsd: Number(diamond.price || 0) + metal.priceUsd,
  };
}

const STORAGE_KEY = "augmont:ring-quotes";
const MAX_LOCAL_QUOTES = 10;

export function saveRingQuoteLocally(p: RingQuotePayload): RingQuotePayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const arr: RingQuotePayload[] = raw ? JSON.parse(raw) : [];
    const next = [p, ...arr].slice(0, MAX_LOCAL_QUOTES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function submitRingQuote(p: RingQuotePayload): Promise<{ ok: boolean; id?: string }> {
  try {
    const res = await fetch("/api/ring-quotes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!res.ok) {
      console.warn("[ringQuote] non-200 response from /api/ring-quotes:", res.status);
      return { ok: false };
    }
    const json = (await res.json()) as { ok?: boolean; id?: string };
    return { ok: json.ok !== false, id: json.id };
  } catch (e) {
    console.warn("[ringQuote] submit failed:", e);
    return { ok: false };
  }
}
