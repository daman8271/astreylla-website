"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRingStudio, getMetalFromKey } from "./RingStudioContext";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { diamondImageUrl } from "@/lib/diamondImage";

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
  const { state, setDiamond, setSetting, setFlowOrder } = useRingStudio();
  const { formatPrice } = useCurrency();
  const { diamond, setting, metalKey, shape } = state;
  const metal = getMetalFromKey(setting, metalKey);

  // Called when user clicks the Diamond step while in setting-first mode with no diamond selected.
  // Switches the flow to diamond-first and navigates to the diamond catalog.
  const switchToDiamondFirst = () => {
    setFlowOrder("diamond-first");
    router.push("/ring-studio/diamond");
  };

  // Called when user clicks the Setting step while in diamond-first mode with no setting selected.
  // Switches the flow back to setting-first and navigates to the setting catalog.
  const switchToSettingFirst = () => {
    setFlowOrder("setting-first");
    router.push("/ring-studio/setting");
  };

  // Reopen the chosen setting's detail (to tweak metal / shape).
  const settingDetailUrl = setting
    ? (() => {
        const sp = new URLSearchParams();
        sp.set("settingSku", setting.sku);
        if (metalKey) sp.set("metal", metalKey);
        if (shape) sp.set("shape", shape);
        return `/ring-studio/setting?${sp.toString()}`;
      })()
    : diamond
    ? (() => {
        const sp = new URLSearchParams();
        if (diamond.shape) sp.set("shape", diamond.shape);
        if (diamond.id) sp.set("diamondId", diamond.stockNum || diamond.id);
        return `/ring-studio/setting?${sp.toString()}`;
      })()
    : "/ring-studio/setting";

  // Step 2 (Diamond) URL, carrying the setting context for filtering.
  const diamondStepUrl = setting
    ? (() => {
        const sp = new URLSearchParams();
        sp.set("settingSku", setting.sku);
        if (metalKey) sp.set("metal", metalKey);
        if (shape) sp.set("shape", shape);
        return `/ring-studio/diamond?${sp.toString()}`;
      })()
    : diamond
    ? (() => {
        const sp = new URLSearchParams();
        if (diamond.shape) sp.set("shape", diamond.shape);
        if (diamond.id) sp.set("diamondId", diamond.stockNum || diamond.id);
        return `/ring-studio/diamond?${sp.toString()}`;
      })()
    : "/ring-studio/diamond";

  // Step 3 (Complete) URL, carrying setting & diamond context
  const completeStepUrl = setting && diamond
    ? (() => {
        const sp = new URLSearchParams();
        sp.set("settingSku", setting.sku);
        if (metalKey) sp.set("metal", metalKey);
        const sh = shape || diamond.shape;
        if (sh) sp.set("shape", sh);
        if (diamond.id) sp.set("diamondId", diamond.id);
        return `/ring-studio/complete?${sp.toString()}`;
      })()
    : "/ring-studio/setting";

  const removeSetting = (e: React.MouseEvent) => {
    e.preventDefault();
    setSetting(null);
    if (state.flowOrder === "diamond-first") {
      const sp = new URLSearchParams();
      if (diamond?.shape) sp.set("shape", diamond.shape);
      if (diamond?.id) sp.set("diamondId", diamond.stockNum || diamond.id);
      router.push(`/ring-studio/setting?${sp.toString()}`);
    } else {
      router.push("/ring-studio/setting");
    }
  };
  const removeDiamond = (e: React.MouseEvent) => {
    e.preventDefault();
    setDiamond(null);
    if (state.flowOrder === "diamond-first") {
      router.push("/ring-studio/diamond");
    } else {
      router.push(diamondStepUrl);
    }
  };

  const total = (diamond?.price || 0) + (metal?.priceUsd || 0);
  const settingPrice = metal?.priceUsd || setting?.basePriceUsd || 0;

  const steps = state.flowOrder === "diamond-first"
    ? (["diamond", "setting", "complete"] as const)
    : (["setting", "diamond", "complete"] as const);

  return (
    <ol className="rs-stepper" aria-label="Ring studio progress">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        if (step === "setting") {
          return (
            <li key="setting" className={`rs-step ${current === "setting" ? "rs-step--active" : ""} ${setting ? "rs-step--filled" : ""}`} aria-current={current === "setting" ? "step" : undefined}>
              {setting ? (
                <Link href={settingDetailUrl} className="rs-step__chip">
                  <span className="rs-step__chip-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={metal?.imageUrl || setting.defaultThumbnail} alt="" />
                  </span>
                  <span className="rs-step__chip-meta">
                    <span className="rs-step__chip-title">{setting.name} ({setting.sku})</span>
                    <span className="rs-step__chip-row">
                      <strong>{formatPrice(settingPrice)}</strong>
                      <button type="button" className="rs-step__remove" onClick={removeSetting}>Remove</button>
                    </span>
                  </span>
                  <span className="rs-step__check" aria-label="Selected">{CheckIcon}</span>
                </Link>
              ) : (state.flowOrder === "setting-first" || diamond) ? (
                <Link href={settingDetailUrl} className="rs-step__label">
                  <StepNumber n={stepNum} active={current === "setting"} />
                  <span className="rs-step__title">
                    <span className="rs-step__sub">Choose a</span>
                    <span className="rs-step__main">{RingIcon} Setting</span>
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="rs-step__label rs-step__label--switch"
                  onClick={switchToSettingFirst}
                  title="Switch back to choosing a setting first"
                >
                  <StepNumber n={stepNum} active={current === "setting"} />
                  <span className="rs-step__title">
                    <span className="rs-step__sub">Choose a</span>
                    <span className="rs-step__main">{RingIcon} Setting</span>
                  </span>
                </button>
              )}
            </li>
          );
        }

        if (step === "diamond") {
          return (
            <li key="diamond" className={`rs-step ${current === "diamond" ? "rs-step--active" : ""} ${diamond ? "rs-step--filled" : ""}`} aria-current={current === "diamond" ? "step" : undefined}>
              {diamond ? (
                <Link href={diamondStepUrl} className="rs-step__chip">
                  <span className="rs-step__chip-thumb">
                    {diamond.id ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={diamondImageUrl(diamond.id)} alt="" />
                    ) : (
                      <span aria-hidden>{DiamondIcon}</span>
                    )}
                  </span>
                  <span className="rs-step__chip-meta">
                    <span className="rs-step__chip-title">{diamond.title || `${Number(diamond.carat).toFixed(2)}ct ${diamond.shape || "Diamond"}`}</span>
                    <span className="rs-step__chip-row">
                      <strong>{formatPrice(diamond.price || 0)}</strong>
                      <button type="button" className="rs-step__remove" onClick={removeDiamond}>Remove</button>
                    </span>
                  </span>
                  <span className="rs-step__check" aria-label="Selected">{CheckIcon}</span>
                </Link>
              ) : (state.flowOrder === "diamond-first" || setting) ? (
                <Link href={diamondStepUrl} className="rs-step__label">
                  <StepNumber n={stepNum} active={current === "diamond"} />
                  <span className="rs-step__title">
                    <span className="rs-step__sub">Choose a</span>
                    <span className="rs-step__main">{DiamondIcon} Diamond</span>
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="rs-step__label rs-step__label--switch"
                  onClick={switchToDiamondFirst}
                  title="Start with a diamond instead"
                >
                  <StepNumber n={stepNum} active={current === "diamond"} />
                  <span className="rs-step__title">
                    <span className="rs-step__sub">Choose a</span>
                    <span className="rs-step__main">{DiamondIcon} Diamond</span>
                  </span>
                </button>
              )}
            </li>
          );
        }

        // Complete step
        return (
          <li key="complete" className={`rs-step ${current === "complete" ? "rs-step--active" : ""} ${diamond && setting ? "rs-step--filled" : ""}`} aria-current={current === "complete" ? "step" : undefined}>
            {diamond && setting ? (
              <Link href={completeStepUrl} className="rs-step__chip rs-step__chip--total">
                <span className="rs-step__chip-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={metal?.imageUrl || setting.defaultThumbnail} alt="" />
                </span>
                <span className="rs-step__chip-meta">
                  <span className="rs-step__chip-title">Complete ring</span>
                  <span className="rs-step__chip-row">
                    <strong>{formatPrice(total)}</strong>
                  </span>
                </span>
              </Link>
            ) : (
              <span className="rs-step__label rs-step__label--disabled">
                <StepNumber n={stepNum} active={current === "complete"} />
                <span className="rs-step__title">
                  <span className="rs-step__sub">Complete your</span>
                  <span className="rs-step__main">{RingIcon} Ring</span>
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
