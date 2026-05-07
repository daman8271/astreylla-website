"use client";

import { useState } from "react";
import type { Diamond } from "./types";

type Props = {
  diamond: Diamond;
  currency: string;
  onAddToCart?: (d: Diamond) => void;
  onOpen?: (d: Diamond) => void;
  busy?: boolean;
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

function formatMoney(amount: number, currency: string) {
  // No rounding. Use the API's own value verbatim — Intl applies standard
  // currency formatting (thousands separators + the currency's own minor-unit
  // precision, e.g. 2 decimals for USD).
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

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
  // attributes that aren't in the API response.
  if (d.title && d.title.trim()) return d.title.trim();
  const ct = Number(d.carat || 0).toFixed(2);
  const rawShape = d.shape || "";
  const shape = SHAPE_LABELS[titleCase(rawShape)] || titleCase(rawShape) || "Diamond";
  return `${ct}ct ${shape}`.trim();
}

function certBadge(lab: string | undefined) {
  const v = (lab || "").toUpperCase();
  if (["GIA", "IGI", "HRD"].includes(v)) return `${v} Certified`;
  return "Certified";
}

export function DiamondCard({ diamond, currency, onAddToCart, onOpen, busy }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const open = () => onOpen?.(diamond);
  const onKeyOpen = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <article
      className="ds-card ds-card--clickable"
      onClick={open}
      onKeyDown={onKeyOpen}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${formatTitle(diamond)}`}
    >
      <div className="ds-card__media">
        {!imgFailed && diamond.image_url ? (
          <img
            src={diamond.image_url}
            alt={formatTitle(diamond)}
            loading="lazy"
            onError={() => setImgFailed(true)}
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
      </div>

      <h3 className="ds-card__title">{formatTitle(diamond)}</h3>

      <div className="ds-card__attrs">
        {diamond.color ? (
          <>
            <span className="ds-card__attr-key">Colour:</span>{" "}
            <span className="ds-card__attr-val">{diamond.color}</span>
          </>
        ) : null}
        {diamond.clarity ? (
          <>
            ,{" "}
            <span className="ds-card__attr-key">Clarity:</span>{" "}
            <span className="ds-card__attr-val">{diamond.clarity}</span>
          </>
        ) : null}
        {diamond.cut ? (
          <>
            ,{" "}
            <span className="ds-card__attr-key">Cut:</span>{" "}
            <span className="ds-card__attr-val">{cutShort(diamond.cut)}</span>
          </>
        ) : null}
      </div>

      <div className="ds-card__price-row">
        <div className="ds-card__price">
          <strong>{formatMoney(diamond.price || 0, currency)}</strong>
          <span className="ds-card__currency">{currency}</span>
        </div>
        <div className="ds-card__cert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          <span>{certBadge(diamond.lab)}</span>
        </div>
      </div>

      <button
        type="button"
        className="ds-card__cta"
        onClick={() => onAddToCart?.(diamond)}
        disabled={busy}
      >
        {busy ? "Adding…" : "Add to cart"}
      </button>
    </article>
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
