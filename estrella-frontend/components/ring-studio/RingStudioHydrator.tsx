"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRingStudio } from "./RingStudioContext";
import { getSettingBySku } from "@/lib/settings";
import type { RegionCode } from "@/lib/ringSizes";

/**
 * Bridges URL search params → Context. Mounted in app/ring-studio/layout.tsx.
 *
 * - Settings hydrate from `?settingSku=` via the in-memory mock catalog.
 * - Diamonds rely on sessionStorage seeded at selection time (Stage 1 always
 *   sets the full normalized object on Context before navigating). On a
 *   sessionStorage-cold reload the page-level empty state takes over.
 * - Metal / shape / region / size sync URL → state and survive reloads.
 */
export function RingStudioHydrator() {
  const params = useSearchParams();
  const { state, setSetting, setMetalKey, setShape, setRegion, setSize } = useRingStudio();

  useEffect(() => {
    const settingSku = params.get("settingSku");
    const metalKey = params.get("metal");
    const shape = params.get("shape");
    const region = params.get("region") as RegionCode | null;
    const sizeValue = params.get("size");

    // Hydrate setting if URL has it and Context doesn't match.
    if (settingSku && (!state.setting || state.setting.sku !== settingSku)) {
      const s = getSettingBySku(settingSku);
      if (s) {
        const m = metalKey ? s.metals.find((mm) => `${mm.karat}-${mm.color}` === metalKey) : s.metals[0];
        setSetting(s, m, shape ?? state.shape ?? state.diamond?.shape ?? null);
      }
    }

    // Sync metal/shape independently when only those params change.
    if (metalKey && state.metalKey !== metalKey) setMetalKey(metalKey);
    if (shape && state.shape !== shape) setShape(shape);
    if (region && state.region !== region) setRegion(region);
    if (sizeValue && state.size?.value !== sizeValue) {
      setSize({ label: sizeValue, value: sizeValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return null;
}
