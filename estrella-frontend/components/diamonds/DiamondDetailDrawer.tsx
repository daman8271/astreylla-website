"use client";

import { useEffect, useRef, useState } from "react";
import type { Diamond } from "./types";

type Props = {
  diamond: Diamond | null;
  diamondId: string | null;
  currency: string;
  onClose: () => void;
  onAddToCart?: (d: Diamond) => void;
  busyAddId?: string | null;
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
  if (d.title && d.title.trim()) return d.title.trim();
  const ct = Number(d.carat || 0).toFixed(2);
  const rawShape = d.shape || "";
  const shape =
    SHAPE_LABELS[titleCase(rawShape)] || titleCase(rawShape) || "Diamond";
  return `${ct}ct ${shape}`.trim();
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function certLabel(lab: string | undefined) {
  const v = (lab || "").toUpperCase();
  if (["GIA", "IGI", "HRD"].includes(v)) return `${v} Certified`;
  return null;
}

function maskedCertNumber(stockNum: string | undefined) {
  const v = (stockNum || "").trim();
  if (!v) return null;
  if (v.length <= 4) return v + "*****";
  return v.slice(0, 4) + "*****";
}

type SpecRow = { label: string; value: string };

function buildSpecRows(d: Diamond): SpecRow[] {
  const rows: SpecRow[] = [];
  if (d.shape) {
    const s = SHAPE_LABELS[titleCase(d.shape)] || titleCase(d.shape);
    rows.push({ label: "Shape", value: s });
  }
  if (typeof d.carat === "number" && d.carat > 0) {
    rows.push({ label: "Carat", value: d.carat.toFixed(2) });
  }
  if (d.color) rows.push({ label: "Colour", value: d.color });
  if (d.clarity) rows.push({ label: "Clarity", value: d.clarity });
  if (d.cut) rows.push({ label: "Cut", value: d.cut });
  if (d.polish) rows.push({ label: "Polish", value: d.polish });
  if (d.symmetry) rows.push({ label: "Symmetry", value: d.symmetry });
  if (d.measurements) rows.push({ label: "Measurements", value: d.measurements });
  return rows;
}

export function DiamondDetailDrawer({
  diamond,
  diamondId,
  currency,
  onClose,
  onAddToCart,
  busyAddId,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset image-error state when the displayed diamond changes
  useEffect(() => {
    setImgFailed(false);
  }, [diamond?.id]);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Move focus to drawer on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const isMissing = !diamond;

  if (isMissing) {
    return (
      <div className="ds-drawer-backdrop" onClick={onClose} role="presentation">
        <div
          className="ds-drawer ds-drawer--missing"
          role="dialog"
          aria-modal="true"
          aria-label="Diamond unavailable"
          tabIndex={-1}
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="ds-drawer__back"
            onClick={onClose}
            aria-label="Back to browse"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6 L9 12 L15 18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span>Back to browse</span>
          </button>
          <div className="ds-drawer__missing-body">
            <h2>Diamond unavailable</h2>
            <p>
              The diamond you&apos;re looking for{diamondId ? ` (${diamondId})` : ""} isn&apos;t
              loaded right now. Head back and try the catalog.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const d = diamond;
  const title = formatTitle(d);
  const subline = [
    d.color ? { k: "Color", v: d.color } : null,
    d.clarity ? { k: "Clarity", v: d.clarity } : null,
    d.cut ? { k: "Cut", v: cutShort(d.cut) } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  const cert = certLabel(d.lab);
  const stockNum = maskedCertNumber(d.stockNum);
  const specRows = buildSpecRows(d);

  return (
    <div className="ds-drawer-backdrop" onClick={onClose} role="presentation">
      <div
        className="ds-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ds-drawer-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-drawer__handle" aria-hidden />

        <button
          type="button"
          className="ds-drawer__back"
          onClick={onClose}
          aria-label="Back to browse"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6 L9 12 L15 18" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span>Back to browse</span>
        </button>

        <div className="ds-drawer__layout">
          <div className="ds-drawer__media">
            {!imgFailed && d.image_url ? (
              <img
                src={d.image_url}
                alt={title}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="ds-drawer__placeholder" aria-hidden>
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
                    stroke="#c9a961"
                    strokeWidth="1.2"
                    fill="rgba(201,169,97,0.08)"
                  />
                </svg>
              </div>
            )}
            {d.video_url ? (
              <a
                className="ds-drawer__360"
                href={d.video_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open 360° viewer in a new tab"
              >
                360
              </a>
            ) : null}
          </div>

          <div className="ds-drawer__panel">
            <h2 id="ds-drawer-title" className="ds-drawer__title">
              {title}
            </h2>

            {subline.length ? (
              <div className="ds-drawer__subline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                {subline.map((s, i) => (
                  <span key={s.k}>
                    {i > 0 ? <span className="ds-drawer__dot" aria-hidden>·</span> : null}
                    <span className="ds-drawer__attr-key">{s.k}</span>{" "}
                    <span className="ds-drawer__attr-val">{s.v}</span>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="ds-drawer__ships">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 7 L14 7 L14 16 L3 16 Z M14 10 L18 10 L21 13 L21 16 L14 16 Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle cx="7" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="17" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span>Ships in 5-7 business days</span>
            </div>

            {cert ? (
              <div className="ds-drawer__cert">
                <div className="ds-drawer__cert-logo" aria-hidden>
                  <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" stroke="#b88a4a" strokeWidth="1.5" fill="#fff" />
                    <circle cx="32" cy="32" r="22" stroke="#b88a4a" strokeWidth="1" fill="none" />
                    <text
                      x="32"
                      y="36"
                      textAnchor="middle"
                      fontFamily="serif"
                      fontSize="14"
                      fontWeight="700"
                      fill="#b88a4a"
                    >
                      {(d.lab || "").toUpperCase().slice(0, 3) || "CERT"}
                    </text>
                  </svg>
                </div>
                <div className="ds-drawer__cert-body">
                  <div className="ds-drawer__cert-title">{cert}</div>
                  {stockNum ? (
                    <div className="ds-drawer__cert-num">
                      Stock Number <span>{stockNum}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="ds-drawer__price-row">
              <div className="ds-drawer__price-label">
                <strong>Price</strong>
                <span>Price only for diamond</span>
              </div>
              <div className="ds-drawer__price-vals">
                <strong>{formatMoney(d.price || 0, currency)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="ds-drawer__cta"
              onClick={() => onAddToCart?.(d)}
              disabled={busyAddId === d.id}
            >
              {busyAddId === d.id ? "Adding…" : "Add to cart"}
            </button>
            <button type="button" className="ds-drawer__cta-secondary">
              Talk to an expert
            </button>
          </div>
        </div>

        {specRows.length ? (
          <div className="ds-drawer__details">
            <button
              type="button"
              className="ds-drawer__details-head"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
            >
              <span>Diamond details</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                style={{
                  transform: detailsOpen ? "rotate(180deg)" : "none",
                  transition: "transform .2s ease",
                }}
              >
                <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            {detailsOpen ? (
              <dl className="ds-drawer__spec-grid">
                {specRows.map((r) => (
                  <div className="ds-drawer__spec-row" key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
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
