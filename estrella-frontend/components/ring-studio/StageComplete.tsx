"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { RingGallery } from "./RingGallery";
import { RingSummaryCard } from "./RingSummaryCard";
import { FingerSizeSelector } from "./FingerSizeSelector";
import { OrderTotal } from "./OrderTotal";
import { buildRingQuotePayload, saveRingQuoteLocally, submitRingQuote } from "@/lib/ringQuote";
import { metalLabel } from "./setting-types";
import type { RegionCode } from "@/lib/ringSizes";

const DiamondIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 3 L18 3 L21 9 L12 21 L3 9 Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RingIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 8 L12 4 L15 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RulerIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="9" width="18" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6 9 L6 12 M9 9 L9 13 M12 9 L12 12 M15 9 L15 13 M18 9 L18 12" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export function StageComplete() {
  const router = useRouter();
  const { state, setRegion, setSize, reset } = useRingStudio();
  const { diamond, setting, metalKey: chosenMetalKey, shape, region, size } = state;
  const metal = getMetalFromKey(setting, chosenMetalKey);

  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bounce back if missing context.
  useEffect(() => {
    if (!diamond) {
      router.replace("/ring-studio/diamond");
    } else if (!setting) {
      router.replace(`/ring-studio/setting?diamondId=${encodeURIComponent(diamond.stockNum || diamond.id)}`);
    }
  }, [diamond, setting, router]);

  if (!diamond || !setting || !metal) {
    return (
      <div className="rs-empty-stage">
        <p>Loading your ring…</p>
      </div>
    );
  }

  const totalUsd = (diamond.price || 0) + metal.priceUsd;
  const canSubmit = !!region && !!size;
  const ctaLabel = !region ? "Select region" : !size ? "Select ring size" : "Request quote";

  const onPrimary = async () => {
    if (!region || !size) return;
    setBusy(true);
    try {
      const payload = buildRingQuotePayload({
        diamond,
        setting,
        metal,
        shape: shape || diamond.shape || "Round",
        region,
        size,
      });
      saveRingQuoteLocally(payload);
      const res = await submitRingQuote(payload);
      const id = res.id || `local_${Date.now().toString(36)}`;
      setSuccessMessage(
        `Saved! Quote ${id} — we'll email a final price within 24 hours. (No payment taken.)`
      );
    } finally {
      setBusy(false);
    }
  };

  const onWishlist = () => {
    setSuccessMessage("Saved to your wishlist.");
  };

  const removeSetting = () => {
    router.push(`/ring-studio/setting?diamondId=${encodeURIComponent(diamond.stockNum || diamond.id)}`);
  };
  const removeDiamond = () => {
    reset();
    router.push("/ring-studio/diamond");
  };

  return (
    <div className="rs-complete">
      <div className="rs-complete__grid">
        <div className="rs-complete__left">
          <RingGallery setting={setting} metal={metal} diamond={diamond} />
        </div>
        <div className="rs-complete__right">
          <h2 className="rs-complete__title">Your ring summary</h2>
          <div className="rs-complete__cards">
            <RingSummaryCard
              icon={RingIcon}
              title={`${setting.name} (${setting.sku})`}
              meta={`${metalLabel(metal)} / ${shape || diamond.shape || "—"}`}
              priceUsd={metal.priceUsd}
              onRemove={removeSetting}
            />
            <RingSummaryCard
              icon={DiamondIcon}
              title={`${Number(diamond.carat).toFixed(2)}ct ${diamond.shape || ""} Lab Grown Diamond`.trim()}
              meta={`Colour ${diamond.color || "—"}, Clarity ${diamond.clarity || "—"}`}
              priceUsd={diamond.price || 0}
              onRemove={removeDiamond}
            />
            <FingerSizeSelector
              region={region}
              size={size}
              onChange={(r, s) => {
                setRegion(r as RegionCode | null);
                setSize(s);
              }}
            />
          </div>
          <OrderTotal
            totalUsd={totalUsd}
            ctaLabel={ctaLabel}
            ctaDisabled={!canSubmit}
            ctaIcon={RulerIcon}
            onPrimary={onPrimary}
            onWishlist={onWishlist}
            busy={busy}
            successMessage={successMessage}
          />
        </div>
      </div>
    </div>
  );
}
