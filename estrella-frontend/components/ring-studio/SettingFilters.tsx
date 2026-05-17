"use client";

import { useState } from "react";
import type { SettingStyle, SettingKarat, SettingColor } from "./setting-types";
import { SETTING_STYLES } from "./setting-types";
import { RangeSlider } from "@/components/diamonds/RangeSlider";
import { ShapeMaskIcon, type ShapeName } from "@/components/nav/ShapeMaskIcon";
import { RingStyleMaskIcon, normalizeRingStyle } from "@/components/nav/RingStyleMaskIcon";

export type SettingFilterState = {
  styles: Set<SettingStyle>;
  metalKeys: Set<string>;
  priceRange: [number, number];
};

export const PRICE_FLOOR = 100;
export const PRICE_CEIL = 5000;

export const DEFAULT_SETTING_FILTERS: SettingFilterState = {
  styles: new Set(),
  metalKeys: new Set(),
  priceRange: [PRICE_FLOOR, PRICE_CEIL],
};

const PRIMARY_STYLES: SettingStyle[] = ["Halo", "Hidden Halo", "Nature", "Pave", "Side Stone"];

const PRIMARY_METALS: { karat: SettingKarat; color: SettingColor }[] = [
  { karat: "9K", color: "Rose" },
  { karat: "14K", color: "Rose" },
  { karat: "18K", color: "Rose" },
  { karat: "9K", color: "White" },
  { karat: "14K", color: "White" },
];

const MORE_METALS: { karat: SettingKarat; color: SettingColor }[] = [
  { karat: "18K", color: "White" },
  { karat: "14K", color: "Yellow" },
  { karat: "18K", color: "Yellow" },
  { karat: "PT", color: "Platinum" },
];

const COLOR_BG: Record<SettingColor, string> = {
  Rose: "#e3b8a4",
  White: "#dadada",
  Yellow: "#d8b76a",
  Platinum: "#c8ccd0",
};

type Props = {
  value: SettingFilterState;
  onChange: (next: SettingFilterState) => void;
  lockedShape: string | null;
  hidden: boolean;
  onToggleHide: () => void;
  onClearAll: () => void;
  activeCount: number;
};

export function SettingFilters({ value, onChange, lockedShape, hidden, onToggleHide, onClearAll, activeCount }: Props) {
  const [moreStyles, setMoreStyles] = useState(false);
  const [moreMetals, setMoreMetals] = useState(false);

  const set = <K extends keyof SettingFilterState>(k: K, v: SettingFilterState[K]) =>
    onChange({ ...value, [k]: v });

  const toggleStyle = (s: SettingStyle) => {
    const next = new Set(value.styles);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    set("styles", next);
  };

  const toggleMetal = (key: string) => {
    const next = new Set(value.metalKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    set("metalKeys", next);
  };

  const stylesShown: SettingStyle[] = moreStyles
    ? SETTING_STYLES
    : PRIMARY_STYLES;

  const metalsShown = moreMetals ? [...PRIMARY_METALS, ...MORE_METALS] : PRIMARY_METALS;

  return (
    <section className="rs-filters">
      <div className="rs-filters__bar">
        <button type="button" className="rs-filters__toggle" onClick={onToggleHide}>
          {hidden ? "Show" : "Hide"} all filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <button type="button" className="rs-filters__clear" onClick={onClearAll}>
          ✕ Clear all filters
        </button>
      </div>

      {hidden ? null : (
        <div className="rs-filters__grid">
          {/* LEFT */}
          <div className="rs-filters__col">
            <div className="rs-field">
              <label className="rs-field__label">Style</label>
              <div className="rs-style-row">
                {stylesShown.map((s) => {
                  const active = value.styles.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`rs-style-btn ${active ? "rs-style-btn--active" : ""}`}
                      onClick={() => toggleStyle(s)}
                      aria-pressed={active}
                    >
                      <span className="rs-style-btn__icon" aria-hidden>
                        <RingStyleMaskIcon name={normalizeRingStyle(s)} size={22} />
                      </span>
                      <span className="rs-style-btn__label">{s}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="rs-more" onClick={() => setMoreStyles((s) => !s)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d={moreStyles ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{moreStyles ? "Less Styles" : "More Styles"}</span>
              </button>
            </div>

            <div className="rs-field">
              <label className="rs-field__label">Metal</label>
              <div className="rs-metal-row">
                {metalsShown.map((m) => {
                  const key = `${m.karat}-${m.color}`;
                  const active = value.metalKeys.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`rs-metal-btn ${active ? "rs-metal-btn--active" : ""}`}
                      onClick={() => toggleMetal(key)}
                      aria-pressed={active}
                    >
                      <span
                        className="rs-metal-btn__circle"
                        style={{ background: COLOR_BG[m.color] }}
                        aria-hidden
                      >
                        {m.karat}
                      </span>
                      <span className="rs-metal-btn__label">
                        {m.color === "Platinum" ? "Platinum" : `${m.color} Gold`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="rs-more" onClick={() => setMoreMetals((s) => !s)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d={moreMetals ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{moreMetals ? "Less Metals" : "More Metals"}</span>
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rs-filters__col">
            <div className="rs-field">
              <label className="rs-field__label">Price</label>
              <RangeSlider
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={1}
                value={value.priceRange}
                onChange={(v) => set("priceRange", v)}
                label="Price"
              />
              <div className="rs-input-row">
                <div className="rs-input-prefix">
                  <span className="rs-input-prefix__sym">$</span>
                  <input
                    type="number"
                    min={PRICE_FLOOR}
                    max={value.priceRange[1]}
                    value={value.priceRange[0]}
                    onChange={(e) =>
                      set("priceRange", [
                        Math.max(PRICE_FLOOR, Math.min(Number(e.target.value), value.priceRange[1])),
                        value.priceRange[1],
                      ])
                    }
                  />
                </div>
                <span className="rs-input-row__sep" aria-hidden>—</span>
                <div className="rs-input-prefix">
                  <span className="rs-input-prefix__sym">$</span>
                  <input
                    type="number"
                    min={value.priceRange[0]}
                    max={PRICE_CEIL}
                    value={value.priceRange[1]}
                    onChange={(e) =>
                      set("priceRange", [
                        value.priceRange[0],
                        Math.min(PRICE_CEIL, Math.max(Number(e.target.value), value.priceRange[0])),
                      ])
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rs-field">
              <label className="rs-field__label">Shape</label>
              <div className="rs-shape-locked">
                <span className="rs-shape-locked__chip" aria-disabled>
                  {lockedShape ? (
                    <ShapeMaskIcon
                      name={lockedShape.toLowerCase() as ShapeName}
                      size={16}
                    />
                  ) : null}
                  {lockedShape || "—"}
                </span>
                <span className="rs-shape-locked__note">Locked to your chosen diamond</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
