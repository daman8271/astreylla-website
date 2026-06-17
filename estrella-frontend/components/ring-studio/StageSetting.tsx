"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SettingCatalog } from "./SettingCatalog";
import { SettingDetailView } from "./SettingDetailView";
import { useRingStudio } from "./RingStudioContext";
import { getSettingBySku } from "@/lib/settings";

import type { Setting } from "./setting-types";

// Step 1 — the Ring Studio entry. The customer picks a setting (metal + shape)
// before choosing a diamond.
export function StageSetting({ customSettings }: { customSettings?: Setting[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { state, setSetting } = useRingStudio();

  const sku = params.get("settingSku");
  const setting = sku ? (customSettings?.find((s) => s.sku === sku) || getSettingBySku(sku)) : null;

  // The diamond's shape, used to pre-select the shape in SettingDetailView.
  const lockedShape = state.diamond?.shape || null;

  // In diamond-first flow, don't pre-filter the catalog grid by the diamond's shape —
  // most CRM rings only declare one shape, so filtering by a specific shape hides
  // almost everything. The lockedShape is still forwarded to SettingDetailView so
  // the ring detail pre-selects the diamond's shape when the user opens a ring.
  const catalogShape = state.flowOrder === "diamond-first" ? null : lockedShape;

  const openSetting = (sku: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("settingSku", sku);
    router.push(`/ring-studio/setting?${sp.toString()}`);
  };

  const closeDetail = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("settingSku");
    sp.delete("metal");
    router.replace(`/ring-studio/setting?${sp.toString()}`);
  };

  if (sku && setting) {
    const initialMetalKey = params.get("metal");
    const searchShape = (params.get("shapes") || params.get("shape") || "").split(",")[0] || null;
    return (
      <SettingDetailView
        setting={setting}
        lockedShape={lockedShape}
        defaultShape={searchShape}
        initialMetalKey={initialMetalKey}
        onBack={closeDetail}
        onSelect={({ sku, metalKey, shape }) => {
          const chosen = setting.metals.find((m) => `${m.karat}-${m.color}` === metalKey);
          setSetting(setting, chosen, shape);
          const sp = new URLSearchParams();
          sp.set("settingSku", sku);
          sp.set("metal", metalKey);
          if (shape) sp.set("shape", shape);
          if (state.diamond) {
            sp.set("diamondId", state.diamond.stockNum || state.diamond.id);
            router.push(`/ring-studio/complete?${sp.toString()}`);
          } else {
            router.push(`/ring-studio/diamond?${sp.toString()}`);
          }
        }}
      />
    );
  }

  return <SettingCatalog shape={catalogShape} onOpenSetting={openSetting} customSettings={customSettings} />;
}
