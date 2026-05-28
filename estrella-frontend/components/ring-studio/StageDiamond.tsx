"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DiamondCatalog } from "@/components/diamonds/DiamondCatalog";
import type { Diamond } from "@/components/diamonds/types";
import { useRingStudio } from "./RingStudioContext";

type Props = { shop: string };

// Step 2 — the customer already picked a setting (metal + shape) in Step 1.
// Diamonds are filtered to that shape; the chosen diamond completes the ring.
export function StageDiamond({ shop }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { setDiamond } = useRingStudio();

  const settingSku = params.get("settingSku");
  const metal = params.get("metal");
  const shape = params.get("shape");

  const initialFilters = useMemo(
    () => ({ treatment: "lab-grown" as const, ...(shape ? { shape } : {}) }),
    [shape]
  );

  const onSelect = useCallback(
    (d: Diamond) => {
      setDiamond(d);
      const sp = new URLSearchParams();
      if (settingSku) sp.set("settingSku", settingSku);
      if (metal) sp.set("metal", metal);
      if (shape) sp.set("shape", shape);
      sp.set("diamondId", d.stockNum || d.id);
      router.push(`/ring-studio/complete?${sp.toString()}`);
    },
    [router, setDiamond, settingSku, metal, shape]
  );

  return (
    <DiamondCatalog
      shop={shop}
      mode="ring-studio"
      onSelect={onSelect}
      initialFilters={initialFilters}
    />
  );
}
