"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tier = "video" | "image" | "outline";

const TIER_LABEL: Record<Tier, string> = {
  video: "360°",
  image: "Photo",
  outline: "Outline",
};

const TIERS: Tier[] = ["video", "image", "outline"];

const VIEWER_TIMEOUT_MS = 3500;

type Props = {
  stockNum?: string;
  shape?: string;
  open: boolean;
  onClose: () => void;
};

function buildSrc(stockNum: string, tier: Tier) {
  const t = tier === "outline" ? "image" : tier;
  return `/360-viewer.html?id=${encodeURIComponent(
    stockNum
  )}&type=${t}`;
}

function ShapeOutline({ shape }: { shape?: string }) {
  // Single fallback silhouette — the 360 viewer page has its own per-shape
  // outlines, so this only renders when the iframe times out twice.
  return (
    <svg
      viewBox="0 0 100 100"
      width="120"
      height="120"
      fill="none"
      aria-hidden
      style={{ color: "#c9a961", opacity: 0.7 }}
    >
      <path
        d="M50 10 L78 38 L62 86 L38 86 L22 38 Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M22 38 L78 38 M50 10 L50 86 M38 86 L22 38 L50 10 L78 38 L62 86"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
      />
      {shape ? (
        <text
          x="50"
          y="98"
          textAnchor="middle"
          fontSize="6"
          fill="currentColor"
          fontFamily="var(--font-sans)"
        >
          {shape}
        </text>
      ) : null}
    </svg>
  );
}

export function DiamondViewer({ stockNum, shape, open, onClose }: Props) {
  const [tier, setTier] = useState<Tier>("video");
  const [loadedTier, setLoadedTier] = useState<Tier | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const src = useMemo(
    () => (stockNum ? buildSrc(stockNum, tier) : ""),
    [stockNum, tier]
  );

  // Reset tier to "video" each time the viewer reopens for a different stone
  useEffect(() => {
    if (open) {
      setTier("video");
      setLoadedTier(null);
    }
  }, [open, stockNum]);

  // Auto-degrade: if the iframe `load` event hasn't fired by VIEWER_TIMEOUT_MS,
  // promote video → image → outline.
  useEffect(() => {
    if (!open || tier === "outline" || !stockNum) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // If we never registered a successful load for THIS tier, demote.
      if (loadedTier !== tier) {
        setTier((cur) => (cur === "video" ? "image" : "outline"));
      }
    }, VIEWER_TIMEOUT_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [tier, open, stockNum, loadedTier]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !stockNum) return null;

  return (
    <div
      className="ds-viewer-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Diamond 360 viewer"
      onClick={onClose}
    >
      <div className="ds-viewer-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="ds-viewer-modal__close"
          onClick={onClose}
          aria-label="Close viewer"
        >
          ×
        </button>

        <div className="ds-viewer-stage">
          {tier === "outline" ? (
            <div className="ds-viewer-stage__outline">
              <ShapeOutline shape={shape} />
            </div>
          ) : (
            <iframe
              key={`${stockNum}-${tier}`}
              ref={iframeRef}
              src={src}
              className="ds-viewer-iframe"
              title={`Diamond ${stockNum} ${TIER_LABEL[tier]} viewer`}
              allow="autoplay; fullscreen"
              loading="eager"
              onLoad={() => setLoadedTier(tier)}
            />
          )}
        </div>

        <div className="ds-viewer-tiers" role="tablist" aria-label="Viewer mode">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tier === t}
              className={`ds-viewer-tier ${
                tier === t ? "ds-viewer-tier--active" : ""
              }`}
              onClick={() => setTier(t)}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="ds-viewer-meta">Stock #{stockNum}</div>
      </div>
    </div>
  );
}
