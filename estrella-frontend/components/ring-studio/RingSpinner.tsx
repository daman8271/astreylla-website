"use client";

import { useEffect, useRef, useState } from "react";
import { SettingPlaceholder } from "./SettingPlaceholder";
import type { SettingColor } from "./setting-types";

type Props = {
  frames?: string[];
  fallbackSrc?: string;
  fallbackColor?: SettingColor;
  alt?: string;
};

/**
 * Frame-based 360° viewer. Drag to rotate. When `frames` is empty/short, it
 * degrades to a single static image; if that also fails, an inline
 * <SettingPlaceholder> renders. Hand-rolled (no 3D libs).
 */
export function RingSpinner({ frames, fallbackSrc, fallbackColor = "White", alt = "Ring" }: Props) {
  const usable = (frames?.length ?? 0) >= 8 ? frames! : null;
  const [idx, setIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Preload all frames for smooth scrub.
  useEffect(() => {
    if (!usable) return;
    usable.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [usable]);

  if (!usable) {
    if (fallbackSrc && !imgFailed) {
      return (
        <div className="rs-spinner rs-spinner--static">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackSrc} alt={alt} onError={() => setImgFailed(true)} />
        </div>
      );
    }
    return (
      <div className="rs-spinner rs-spinner--placeholder">
        <SettingPlaceholder color={fallbackColor} label={alt} />
      </div>
    );
  }

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startIdx: idx };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const w = containerRef.current?.clientWidth || 400;
    const advance = Math.round((dx / w) * usable.length);
    const next = ((dragRef.current.startIdx + advance) % usable.length + usable.length) % usable.length;
    setIdx(next);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="rs-spinner"
      role="img"
      aria-label={`${alt} — drag to rotate`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: "none", cursor: "grab" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={usable[idx]} alt="" draggable={false} />
      <span className="rs-spinner__badge" aria-hidden>360°</span>
    </div>
  );
}
