"use client";

import { useEffect, useMemo, useState } from "react";
import { SHAPES_PRIMARY } from "@/components/diamonds/types";
import type { Setting, SettingMetal, SettingColor, SettingKarat } from "./setting-types";
import { metalKey, metalLabel } from "./setting-types";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { RingSpinner } from "./RingSpinner";
import { RingStyleMaskIcon, normalizeRingStyle } from "@/components/nav/RingStyleMaskIcon";
import { ShapeMaskIcon, type ShapeName } from "@/components/nav/ShapeMaskIcon";

type Props = {
  setting: Setting;
  lockedShape: string | null;
  defaultShape?: string | null;
  initialMetalKey?: string | null;
  onBack: () => void;
  onSelect: (params: { sku: string; metalKey: string; shape: string }) => void;
};

const COLOR_BG: Record<SettingColor, string> = {
  Rose: "#e3b8a4",
  White: "#dadada",
  Yellow: "#d8b76a",
  Platinum: "#c8ccd0",
};

const SHAPE_ICONS: Record<string, JSX.Element> = {
  Round: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Princess: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Cushion: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Oval: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="6" ry="9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Pear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C8 8 6 12 6 16 a6 6 0 0 0 12 0 C18 12 16 8 12 3 Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Emerald: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 4 L16 4 L20 8 L20 16 L16 20 L8 20 L4 16 L4 8 Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
};

export function SettingDetailView({ setting, lockedShape, defaultShape, initialMetalKey, onBack, onSelect }: Props) {
  const { formatPrice, currency } = useCurrency();
  const [chosenMetalKey, setChosenMetalKey] = useState<string>(
    initialMetalKey || metalKey(setting.metals[0])
  );
  const [descOpen, setDescOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(true);
  // Which still the gallery is showing; null = the default 360° spin video.
  const [activeStill, setActiveStill] = useState<string | null>(null);

  const metal: SettingMetal =
    setting.metals.find((m) => metalKey(m) === chosenMetalKey) || setting.metals[0];

  // Switching metal swaps the whole asset set — return to the spin view.
  useEffect(() => {
    setActiveStill(null);
  }, [chosenMetalKey]);

  const stills = metal.thumbnails ?? [];

  const shapesToShow = useMemo(() => {
    const activeShape = lockedShape || defaultShape;
    if (activeShape && setting.availableShapes.includes(activeShape as never)) {
      return [activeShape];
    }
    return SHAPES_PRIMARY.filter((s) => setting.availableShapes.includes(s as never));
  }, [setting, lockedShape, defaultShape]);

  const initialShape = useMemo(() => {
    if (lockedShape && setting.availableShapes.includes(lockedShape as never)) {
      return lockedShape;
    }
    if (defaultShape && setting.availableShapes.includes(defaultShape as never)) {
      return defaultShape;
    }
    return setting.availableShapes[0] as string;
  }, [lockedShape, defaultShape, setting.availableShapes]);

  // Shape is selectable here (no diamond chosen yet). When a lockedShape is
  // passed (legacy diamond-first flow) it stays fixed.
  const [chosenShape, setChosenShape] = useState<string>(initialShape);

  return (
    <div className="rs-detail">
      <button type="button" className="rs-detail__back" onClick={onBack}>
        ‹ Back to browse
      </button>

      <div className="rs-detail__grid">
        {/* LEFT — gallery + thumbnail strip */}
        <div className="rs-detail__media">
          <div className="rs-detail__gallery">
            <RingSpinner
              // A still is selected -> show just that image; otherwise the 360° spin video.
              videoSrc={activeStill ? undefined : metal.videoUrl}
              frames={activeStill ? undefined : metal.gallery360}
              fallbackSrc={activeStill ?? metal.imageUrl}
              fallbackColor={metal.color}
              alt={`${setting.name} in ${metalLabel(metal)}`}
            />
          </div>
          {(metal.videoUrl || stills.length > 0) && (
            <div className="rs-detail__thumbs" role="group" aria-label="Views">
              {metal.videoUrl && (
                <button
                  type="button"
                  className={`rs-thumb rs-thumb--video ${activeStill === null ? "rs-thumb--active" : ""}`}
                  onClick={() => setActiveStill(null)}
                  aria-label="360° spin view"
                  aria-pressed={activeStill === null}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={metal.imageUrl} alt="" loading="lazy" />
                  <span className="rs-thumb__badge" aria-hidden>
                    360°
                  </span>
                </button>
              )}
              {stills.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`rs-thumb ${activeStill === src ? "rs-thumb--active" : ""}`}
                  onClick={() => setActiveStill(src)}
                  aria-label="View"
                  aria-pressed={activeStill === src}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — config */}
        <div className="rs-detail__config">
          <h2 className="rs-detail__title">
            {setting.name} ({setting.sku})
          </h2>
          <div className="rs-detail__style">
            <RingStyleMaskIcon name={normalizeRingStyle(setting.style)} size={16} />
            <span className="rs-detail__style-key">Style</span>
            <span className="rs-detail__style-val">{setting.style}</span>
          </div>

          <div className="rs-detail__section">
            <div className="rs-detail__section-head">
              <span className="rs-detail__section-key">Shape</span>
              <span className="rs-detail__section-val">{chosenShape}</span>
            </div>
            <div className="rs-shape-row">
              {shapesToShow.map((s) => {
                const isActive = s === chosenShape;
                const enabled = lockedShape ? s === lockedShape : true;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`rs-shape-cell ${isActive ? "rs-shape-cell--active" : ""}`}
                    disabled={!enabled}
                    aria-pressed={isActive}
                    onClick={() => enabled && setChosenShape(s)}
                  >
                    <span className="rs-shape-cell__icon"><ShapeMaskIcon name={s.toLowerCase() as ShapeName} size={22} /></span>
                    <span className="rs-shape-cell__label">{s}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="rs-more">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>More Shapes</span>
            </button>
          </div>

          <div className="rs-detail__section">
            <div className="rs-detail__section-head">
              <span className="rs-detail__section-key">Metal</span>
              <span className="rs-detail__section-val">{metalLabel(metal)}</span>
            </div>
            <div className="rs-metal-row rs-metal-row--detail">
              {setting.metals.slice(0, 5).map((m) => {
                const k = metalKey(m);
                const active = k === chosenMetalKey;
                return (
                  <button
                    key={k}
                    type="button"
                    className={`rs-metal-btn ${active ? "rs-metal-btn--active" : ""}`}
                    onClick={() => setChosenMetalKey(k)}
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
            <button type="button" className="rs-more">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>More Metals</span>
            </button>
          </div>

          <div className="rs-detail__price">
            <span className="rs-detail__price-row">
              <span className="rs-detail__price-key">Price</span>
              <strong>{formatPrice(metal.priceUsd)} {currency}</strong>
            </span>
            <span className="rs-detail__price-note">Price only for Setting</span>
          </div>

          <button
            type="button"
            className="rs-cta rs-cta--primary"
            onClick={() => onSelect({ sku: setting.sku, metalKey: chosenMetalKey, shape: chosenShape })}
          >
            Select Setting
          </button>
          <button type="button" className="rs-cta rs-cta--ghost" disabled title="Coming soon">
            Save for later
          </button>

          <div className="rs-detail__desc">
            <button type="button" className="rs-detail__desc-toggle" onClick={() => setDescOpen((d) => !d)} aria-expanded={descOpen}>
              <span>Description</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d={descOpen ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {descOpen ? <p className="rs-detail__desc-body">{setting.description}</p> : null}
          </div>

          <div className="rs-detail__desc" style={{ marginTop: "16px" }}>
            <button type="button" className="rs-detail__desc-toggle" onClick={() => setSpecsOpen((s) => !s)} aria-expanded={specsOpen}>
              <span>Product Specifications</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d={specsOpen ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {specsOpen ? (
              <div className="rs-specs-table" style={{ marginTop: "12px" }}>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Gross weight</span>
                  <span className="rs-spec-val">{setting.grossWeight || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Net weight</span>
                  <span className="rs-spec-val">{setting.netWeight || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Band width</span>
                  <span className="rs-spec-val">{setting.bandWidth || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Side stones count</span>
                  <span className="rs-spec-val">{setting.sideStonesCount || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Side stones weight</span>
                  <span className="rs-spec-val">{setting.sideStonesWeight || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Side stone colour</span>
                  <span className="rs-spec-val">{setting.sideStoneColour || "-"}</span>
                </div>
                <div className="rs-spec-row">
                  <span className="rs-spec-key">Side stone clarity</span>
                  <span className="rs-spec-val">{setting.sideStoneClarity || "-"}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
