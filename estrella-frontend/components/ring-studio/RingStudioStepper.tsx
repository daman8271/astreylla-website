"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { formatUsd } from "@/lib/settings";

export type Stage = "diamond" | "setting" | "complete";

type Props = { current: Stage };

const DiamondIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 3 L18 3 L21 9 L12 21 L3 9 Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RingIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 8 L12 4 L15 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CheckIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 12 L10 18 L20 6" stroke="#1f8a3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StepNumber({ n, active }: { n: number; active: boolean }) {
  return <span className={`rs-step__num ${active ? "rs-step__num--active" : ""}`}>{n}</span>;
}

export function RingStudioStepper({ current }: Props) {
  const router = useRouter();
  const { state, setDiamond, setSetting } = useRingStudio();
  const { diamond, setting, metalKey } = state;
  const metal = getMetalFromKey(setting, metalKey);

  const removeDiamond = (e: React.MouseEvent) => {
    e.preventDefault();
    setDiamond(null);
    router.push("/ring-studio/diamond");
  };
  const removeSetting = (e: React.MouseEvent) => {
    e.preventDefault();
    setSetting(null);
    if (diamond) router.push(`/ring-studio/setting?diamondId=${encodeURIComponent(diamond.stockNum || diamond.id)}`);
    else router.push("/ring-studio/diamond");
  };

  const total = (diamond?.price || 0) + (metal?.priceUsd || 0);
  const settingPrice = metal?.priceUsd || setting?.basePriceUsd || 0;

  return (
    <ol className="rs-stepper" aria-label="Ring studio progress">
      {/* Slot 1: Diamond */}
      <li className={`rs-step ${current === "diamond" ? "rs-step--active" : ""} ${diamond ? "rs-step--filled" : ""}`} aria-current={current === "diamond" ? "step" : undefined}>
        {diamond ? (
          <Link href="/ring-studio/diamond" className="rs-step__chip">
            <span className="rs-step__chip-thumb">
              {diamond.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={diamond.image_url} alt="" />
              ) : (
                <span aria-hidden>{DiamondIcon}</span>
              )}
            </span>
            <span className="rs-step__chip-meta">
              <span className="rs-step__chip-title">{diamond.title || `${Number(diamond.carat).toFixed(2)}ct ${diamond.shape || "Diamond"}`}</span>
              <span className="rs-step__chip-row">
                <strong>{formatUsd(diamond.price || 0)}</strong>
                <button type="button" className="rs-step__remove" onClick={removeDiamond}>Remove</button>
              </span>
            </span>
            <span className="rs-step__check" aria-label="Selected">{CheckIcon}</span>
          </Link>
        ) : (
          <Link href="/ring-studio/diamond" className="rs-step__label">
            <StepNumber n={1} active={current === "diamond"} />
            <span className="rs-step__title">
              <span className="rs-step__sub">Choose a</span>
              <span className="rs-step__main">{DiamondIcon} Diamond</span>
            </span>
          </Link>
        )}
      </li>

      {/* Slot 2: Setting */}
      <li className={`rs-step ${current === "setting" ? "rs-step--active" : ""} ${setting ? "rs-step--filled" : ""}`} aria-current={current === "setting" ? "step" : undefined}>
        {setting ? (
          <Link
            href={diamond ? `/ring-studio/setting?diamondId=${encodeURIComponent(diamond.stockNum || diamond.id)}` : "/ring-studio/setting"}
            className="rs-step__chip"
          >
            <span className="rs-step__chip-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={metal?.imageUrl || setting.defaultThumbnail} alt="" />
            </span>
            <span className="rs-step__chip-meta">
              <span className="rs-step__chip-title">{setting.name} ({setting.sku})</span>
              <span className="rs-step__chip-row">
                <strong>{formatUsd(settingPrice)}</strong>
                <button type="button" className="rs-step__remove" onClick={removeSetting}>Remove</button>
              </span>
            </span>
            <span className="rs-step__check" aria-label="Selected">{CheckIcon}</span>
          </Link>
        ) : (
          <span className={`rs-step__label ${current === "setting" ? "" : "rs-step__label--disabled"}`}>
            <StepNumber n={2} active={current === "setting"} />
            <span className="rs-step__title">
              <span className="rs-step__sub">Choose a</span>
              <span className="rs-step__main">{RingIcon} Setting</span>
            </span>
          </span>
        )}
      </li>

      {/* Slot 3: Complete */}
      <li className={`rs-step ${current === "complete" ? "rs-step--active" : ""} ${diamond && setting ? "rs-step--filled" : ""}`} aria-current={current === "complete" ? "step" : undefined}>
        {diamond && setting ? (
          <span className="rs-step__chip rs-step__chip--total">
            <span className="rs-step__chip-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={metal?.imageUrl || setting.defaultThumbnail} alt="" />
            </span>
            <span className="rs-step__chip-meta">
              <span className="rs-step__chip-title">Complete ring</span>
              <span className="rs-step__chip-row">
                <strong>{formatUsd(total)}</strong>
              </span>
            </span>
          </span>
        ) : (
          <span className="rs-step__label rs-step__label--disabled">
            <StepNumber n={3} active={current === "complete"} />
            <span className="rs-step__title">
              <span className="rs-step__sub">Complete your</span>
              <span className="rs-step__main">{RingIcon} Ring</span>
            </span>
          </span>
        )}
      </li>
    </ol>
  );
}
