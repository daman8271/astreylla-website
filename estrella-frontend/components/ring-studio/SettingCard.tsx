"use client";

import { useMemo, useState } from "react";
import type { Setting } from "./setting-types";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { SettingPlaceholder } from "./SettingPlaceholder";

const COLOR_DOT: Record<string, string> = {
  Rose: "#e3b8a4",
  White: "#dadada",
  Yellow: "#d8b76a",
  Platinum: "#c8ccd0",
};

export function SettingCard({
  setting,
  selectedColors,
  onClick,
}: {
  setting: Setting;
  selectedColors?: Set<string>;
  onClick: () => void;
}) {
  const { formatPrice, currency } = useCurrency();
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());
  const [overrideColor, setOverrideColor] = useState<string | null>(null);

  const markFailed = (src: string) =>
    setFailedSrcs((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));

  const colors = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const m of setting.metals) {
      if (!seen.has(m.color)) {
        seen.add(m.color);
        list.push(m.color);
      }
    }
    return list;
  }, [setting.metals]);

  // Colour to display: an explicit dot click wins; otherwise fall back to the
  // first of this ring's colours that matches the active metal filter.
  const activeColor = useMemo(() => {
    if (overrideColor && colors.includes(overrideColor)) return overrideColor;
    if (selectedColors && selectedColors.size > 0) {
      return colors.find((c) => selectedColors.has(c)) ?? null;
    }
    return null;
  }, [overrideColor, selectedColors, colors]);

  const activeMetal = useMemo(
    () => (activeColor ? setting.metals.find((m) => m.color === activeColor) : undefined),
    [activeColor, setting.metals]
  );

  const primarySrc = activeMetal?.imageUrl ?? setting.defaultThumbnail;

  // Second-angle image revealed on hover. When a specific colour is shown, keep
  // the hover image in that same colour so the colour doesn't flip on hover.
  const hoverSrc = useMemo(() => {
    if (activeMetal) {
      return activeMetal.thumbnails?.find((t) => t && t !== primarySrc) ?? null;
    }
    const white = setting.metals.find((m) => m.color === "White");
    const angle = white?.thumbnails?.find((t) => t && t !== setting.defaultThumbnail);
    if (angle) return angle;
    const altMetal = setting.metals.find(
      (m) => m.imageUrl && m.imageUrl !== setting.defaultThumbnail
    );
    return altMetal?.imageUrl ?? null;
  }, [activeMetal, primarySrc, setting]);

  const showPrimary = primarySrc && !failedSrcs.has(primarySrc);
  const showHover = hoverSrc && !failedSrcs.has(hoverSrc);

  return (
    <article
      className="rs-setting-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${setting.name} (${setting.sku})`}
    >
      <div className="rs-setting-card__media">
        {showPrimary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rs-setting-card__img rs-setting-card__img--primary"
            src={primarySrc}
            alt={setting.name}
            loading="lazy"
            onError={() => markFailed(primarySrc)}
          />
        ) : (
          <SettingPlaceholder color={(activeColor as never) || (setting.metals[0]?.color as never) || "White"} label={setting.name} />
        )}
        {showHover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="rs-setting-card__img rs-setting-card__img--hover"
            src={hoverSrc}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => markFailed(hoverSrc)}
          />
        ) : null}
      </div>
      <h3 className="rs-setting-card__title">
        {setting.name} ({setting.sku})
      </h3>
      <div className="rs-setting-card__dots" aria-label="Available metal colors">
        {colors.map((c) => {
          const active = c === activeColor;
          return (
            <button
              key={c}
              type="button"
              className={`rs-setting-card__dot ${active ? "rs-setting-card__dot--active" : ""}`}
              style={{ background: COLOR_DOT[c] || "#ccc" }}
              title={c}
              aria-label={c}
              aria-pressed={active}
              onClick={(e) => {
                e.stopPropagation();
                setOverrideColor((prev) => (prev === c ? null : c));
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          );
        })}
      </div>
      <div className="rs-setting-card__price">{formatPrice(setting.basePriceUsd)}</div>
    </article>
  );
}
