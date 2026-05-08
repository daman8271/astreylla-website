"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SettingCatalog } from "./SettingCatalog";
import { SettingDetailView } from "./SettingDetailView";
import { useRingStudio } from "./RingStudioContext";
import { getSettingBySku } from "@/lib/settings";

export function StageSetting() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, setSetting } = useRingStudio();
  const { diamond } = state;

  // No diamond context (sessionStorage cold) — bounce to Stage 1.
  useEffect(() => {
    if (!diamond) {
      const t = setTimeout(() => {
        if (!diamond) router.replace("/ring-studio/diamond");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [diamond, router]);

  if (!diamond) {
    return (
      <div className="rs-empty-stage">
        <p>Pick a diamond first to choose a setting.</p>
        <button type="button" className="rs-cta rs-cta--primary" onClick={() => router.push("/ring-studio/diamond")}>
          Choose a diamond
        </button>
      </div>
    );
  }

  const sku = params.get("settingSku");
  const setting = sku ? getSettingBySku(sku) : null;

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
    return (
      <SettingDetailView
        setting={setting}
        lockedShape={diamond.shape || null}
        initialMetalKey={initialMetalKey}
        onBack={closeDetail}
        onSelect={({ sku, metalKey, shape }) => {
          const chosen = setting.metals.find((m) => `${m.karat}-${m.color}` === metalKey);
          setSetting(setting, chosen, shape);
          const sp = new URLSearchParams();
          sp.set("diamondId", diamond.stockNum || diamond.id);
          sp.set("settingSku", sku);
          sp.set("metal", metalKey);
          if (shape) sp.set("shape", shape);
          router.push(`/ring-studio/complete?${sp.toString()}`);
        }}
      />
    );
  }

  return <SettingCatalog shape={diamond.shape || null} onOpenSetting={openSetting} />;
}
