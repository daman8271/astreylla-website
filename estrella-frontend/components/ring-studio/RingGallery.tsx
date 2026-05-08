"use client";

import { useState } from "react";
import type { Setting, SettingMetal } from "./setting-types";
import type { Diamond } from "@/components/diamonds/types";
import { SettingPlaceholder } from "./SettingPlaceholder";
import { metalLabel } from "./setting-types";

type GalleryItem = {
  url: string;
  kind: "image" | "video";
  alt: string;
};

export function RingGallery({
  setting,
  metal,
  diamond,
}: {
  setting: Setting;
  metal: SettingMetal;
  diamond: Diamond;
}) {
  const items: GalleryItem[] = [
    { url: metal.imageUrl, kind: "image", alt: `${setting.name} in ${metalLabel(metal)}` },
    ...(diamond.image_url ? [{ url: diamond.image_url, kind: "image" as const, alt: "Centre stone" }] : []),
    ...(diamond.video_url ? [{ url: diamond.video_url, kind: "video" as const, alt: "Centre stone — video" }] : []),
    ...(setting.videoUrl ? [{ url: setting.videoUrl, kind: "video" as const, alt: "Ring — video" }] : []),
  ];
  const [active, setActive] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});
  const item = items[active] || items[0];

  const next = () => setActive((a) => (a + 1) % items.length);
  const prev = () => setActive((a) => (a - 1 + items.length) % items.length);

  return (
    <div className="rs-gallery">
      <div className="rs-gallery__hero">
        {items.length > 1 ? (
          <button type="button" className="rs-gallery__arrow rs-gallery__arrow--left" onClick={prev} aria-label="Previous">
            ‹
          </button>
        ) : null}
        {item.kind === "image" && !imgFailed[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.alt}
            onError={() => setImgFailed((s) => ({ ...s, [active]: true }))}
          />
        ) : item.kind === "video" ? (
          <div className="rs-gallery__video-frame" aria-label={item.alt}>
            <span className="rs-gallery__play">▶</span>
            <span className="rs-gallery__video-note">{item.alt}</span>
          </div>
        ) : (
          <SettingPlaceholder color={metal.color} label={setting.name} />
        )}
        {items.length > 1 ? (
          <button type="button" className="rs-gallery__arrow rs-gallery__arrow--right" onClick={next} aria-label="Next">
            ›
          </button>
        ) : null}
      </div>
      <div className="rs-gallery__thumbs">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            className={`rs-gallery__thumb ${i === active ? "rs-gallery__thumb--active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={it.alt}
          >
            {it.kind === "video" ? (
              <span className="rs-gallery__thumb-play">▶</span>
            ) : null}
            {it.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.url} alt="" />
            ) : (
              <SettingPlaceholder color={metal.color} />
            )}
          </button>
        ))}
      </div>
      <div className="rs-gallery__brand">
        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: 22, letterSpacing: "0.18em" }}>
          AUGMONT
        </span>
      </div>
    </div>
  );
}
