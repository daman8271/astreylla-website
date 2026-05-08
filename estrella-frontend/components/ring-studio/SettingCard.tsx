"use client";

import { useMemo, useState } from "react";
import type { Setting } from "./setting-types";
import { formatUsd } from "@/lib/settings";
import { SettingPlaceholder } from "./SettingPlaceholder";

const COLOR_DOT: Record<string, string> = {
  Rose: "#e3b8a4",
  White: "#dadada",
  Yellow: "#d8b76a",
  Platinum: "#c8ccd0",
};

export function SettingCard({ setting, onClick }: { setting: Setting; onClick: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
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
        {!imgFailed && setting.defaultThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={setting.defaultThumbnail}
            alt={setting.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <SettingPlaceholder color={(setting.metals[0]?.color as never) || "White"} label={setting.name} />
        )}
      </div>
      <h3 className="rs-setting-card__title">
        {setting.name} ({setting.sku})
      </h3>
      <div className="rs-setting-card__dots" aria-label="Available metal colors">
        {colors.map((c) => (
          <span
            key={c}
            className="rs-setting-card__dot"
            style={{ background: COLOR_DOT[c] || "#ccc" }}
            title={c}
            aria-hidden
          />
        ))}
      </div>
      <div className="rs-setting-card__price">{formatUsd(setting.basePriceUsd)} USD</div>
    </article>
  );
}
