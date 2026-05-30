"use client";

import { useState } from "react";
import type { Diamond } from "./types";
import { DiamondViewer } from "./DiamondViewer";
import { diamondImageUrl } from "@/lib/diamondImage";
import { useCurrency } from "@/components/currency/CurrencyContext";

type Props = {
  diamond: Diamond;
  onAddToCart?: (d: Diamond) => void;
  onOpen?: (d: Diamond) => void;
  busy?: boolean;
  mode?: "default" | "ring-studio";
  onSelect?: (d: Diamond) => void;
};

const SHAPE_LABELS: Record<string, string> = {
  Round: "Round",
  Princess: "Princess",
  Cushion: "Cushion",
  "Cushion modified": "Cushion modified",
  Oval: "Oval",
  Pear: "Pear",
  Emerald: "Emerald",
  "Square emerald": "Square emerald",
  Marquise: "Marquise",
  Heart: "Heart",
  Asscher: "Asscher",
  Radiant: "Radiant",
};

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTitle(d: Diamond) {
  // Prefer the server-formatted title; fall back to a minimal carat+shape
  // string built from raw API fields when title is missing. Never invent
  // attributes that aren't in the API response. Used for the full a11y label.
  if (d.title && d.title.trim()) return d.title.trim();
  const ct = Number(d.carat || 0).toFixed(2);
  const rawShape = d.shape || "";
  const shape = SHAPE_LABELS[titleCase(rawShape)] || titleCase(rawShape) || "Diamond";
  return `${ct}ct ${shape}`.trim();
}

function shapeLabel(d: Diamond) {
  const rawShape = d.shape || "";
  return SHAPE_LABELS[titleCase(rawShape)] || titleCase(rawShape) || "Diamond";
}

// Clean, uncluttered heading for the card face: "Princess · 2.03 ct". The
// colour / clarity / cut live in the spec chips below, so the title no longer
// duplicates them the way the verbose API title did.
function cardTitle(d: Diamond) {
  const shape = shapeLabel(d);
  const ct = d.carat ? `${Number(d.carat).toFixed(2)} ct` : "";
  return ct ? `${shape} · ${ct}` : shape;
}

function certBadge(lab: string | undefined) {
  const v = (lab || "").toUpperCase();
  if (["GIA", "IGI", "HRD"].includes(v)) return `${v} Certified`;
  return "Certified";
}

type ImgStage = "resolver" | "placeholder";

export function DiamondCard({ diamond, onAddToCart, onOpen, busy, mode = "default", onSelect }: Props) {
  const { formatPrice, currency: activeCurrency } = useCurrency();
  // Image source: the diamond's still photo loaded straight from the Bunny CDN
  // (built from diamond.id via diamondImageUrl — no Augmont resolver hop). On a
  // genuinely-missing asset, onError fires and we fall through to the SVG
  // placeholder. The Augmont diamond.image_url is intentionally NOT used as
  // <img src> (it's an HTML viewer page); it remains the 360 modal's source.
  const [imgStage, setImgStage] = useState<ImgStage>(
    diamond.id ? "resolver" : "placeholder"
  );
  const [viewerOpen, setViewerOpen] = useState(false);
  const isRingStudio = mode === "ring-studio";
  const open = () => {
    if (isRingStudio) onSelect?.(diamond);
    else onOpen?.(diamond);
  };
  const onKeyOpen = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };
  const handleImgError = () => setImgStage("placeholder");
  const launchViewer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewerOpen(true);
  };

  const imgSrc = imgStage === "resolver" ? diamondImageUrl(diamond.id) : "";

  return (
    <>
    <article
      className="ds-card ds-card--clickable"
      onClick={open}
      onKeyDown={onKeyOpen}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${formatTitle(diamond)}`}
    >
      <div className="ds-card__media">
        {imgSrc ? (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={formatTitle(diamond)}
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div className="ds-card__placeholder" aria-hidden>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
                stroke="#c9a961"
                strokeWidth="1.2"
                fill="rgba(201,169,97,0.08)"
              />
            </svg>
          </div>
        )}
        {diamond.stockNum ? (
          <button
            type="button"
            className="ds-card__view360"
            onClick={launchViewer}
            aria-label={`Open 360 viewer for ${formatTitle(diamond)}`}
          >
            360°
          </button>
        ) : null}
      </div>

      <div className="ds-card__body">
        <h3 className="ds-card__title">{cardTitle(diamond)}</h3>

        <div className="ds-card__specs">
          {diamond.color ? (
            <span className="ds-spec">
              <span className="ds-spec__v">{diamond.color}</span>
              <span className="ds-spec__k">Colour</span>
            </span>
          ) : null}
          {diamond.clarity ? (
            <span className="ds-spec">
              <span className="ds-spec__v">{diamond.clarity}</span>
              <span className="ds-spec__k">Clarity</span>
            </span>
          ) : null}
          {diamond.cut ? (
            <span className="ds-spec">
              <span className="ds-spec__v">{cutShort(diamond.cut)}</span>
              <span className="ds-spec__k">Cut</span>
            </span>
          ) : null}
        </div>

        <div className="ds-card__price-row">
          <div className="ds-card__price">
            <strong>{formatPrice(diamond.price || 0)}</strong>
            <span className="ds-card__currency">{activeCurrency}</span>
          </div>
          <div className="ds-card__cert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <span>{certBadge(diamond.lab)}</span>
          </div>
        </div>

        {isRingStudio ? (
          <button
            type="button"
            className="ds-card__cta ds-card__cta--outline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(diamond);
            }}
          >
            Select diamond
          </button>
        ) : (
          <button
            type="button"
            className="ds-card__cta"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(diamond);
            }}
            disabled={busy}
          >
            {busy ? "Adding…" : "Add to cart"}
          </button>
        )}
      </div>
    </article>
    <DiamondViewer
      stockNum={diamond.stockNum}
      shape={diamond.shape}
      open={viewerOpen}
      onClose={() => setViewerOpen(false)}
    />
    </>
  );
}

function cutShort(c: string) {
  const v = c.toLowerCase();
  if (v.startsWith("very good")) return "VG";
  if (v.startsWith("excellent") || v === "ex") return "EX";
  if (v.startsWith("good")) return "GD";
  if (v.startsWith("ideal")) return "ID";
  if (v.startsWith("fair")) return "F";
  return c;
}
