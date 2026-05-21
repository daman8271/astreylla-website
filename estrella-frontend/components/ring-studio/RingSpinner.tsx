"use client";

import { useEffect, useRef, useState } from "react";
import { SettingPlaceholder } from "./SettingPlaceholder";
import type { SettingColor } from "./setting-types";

type Props = {
  frames?: string[];
  /** 360° spin video (.mp4). Preferred over a static image when present. */
  videoSrc?: string;
  fallbackSrc?: string;
  fallbackColor?: SettingColor;
  alt?: string;
};

/**
 * 360° viewer. Prefers a spin video when given one; otherwise a frame-based
 * drag-to-rotate (needs >=8 frames). Both degrade to a single static image,
 * and finally to an inline <SettingPlaceholder>. Hand-rolled (no 3D libs).
 */
export function RingSpinner({ frames, videoSrc, fallbackSrc, fallbackColor = "White", alt = "Ring" }: Props) {
  const usable = (frames?.length ?? 0) >= 8 ? frames! : null;
  const [idx, setIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset transient failure flags when the source changes (metal switch, etc.).
  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);
  useEffect(() => {
    setImgFailed(false);
  }, [fallbackSrc]);

  // Preload all frames for smooth scrub.
  useEffect(() => {
    if (!usable) return;
    usable.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [usable]);

  // Spin video takes priority — it's the truest "drag to rotate" we have.
  if (videoSrc && !videoFailed) {
    return (
      <div className="rs-spinner rs-spinner--video">
        <video
          src={videoSrc}
          poster={fallbackSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`${alt} — 360° view`}
          onError={() => setVideoFailed(true)}
        />
        <span className="rs-spinner__badge" aria-hidden>
          360°
        </span>
      </div>
    );
  }

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
