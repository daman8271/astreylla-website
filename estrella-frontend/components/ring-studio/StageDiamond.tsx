"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { DiamondCatalog } from "@/components/diamonds/DiamondCatalog";
import type { Diamond } from "@/components/diamonds/types";
import { useRingStudio } from "./RingStudioContext";

type Props = { shop: string };

export function StageDiamond({ shop }: Props) {
  const router = useRouter();
  const { setDiamond } = useRingStudio();

  const onSelect = useCallback(
    (d: Diamond) => {
      setDiamond(d);
      const id = encodeURIComponent(d.stockNum || d.id);
      const shape = d.shape ? `&shape=${encodeURIComponent(d.shape)}` : "";
      router.push(`/ring-studio/setting?diamondId=${id}${shape}`);
    },
    [router, setDiamond]
  );

  return (
    <DiamondCatalog
      shop={shop}
      mode="ring-studio"
      onSelect={onSelect}
      initialFilters={{ treatment: "lab-grown" }}
    />
  );
}
