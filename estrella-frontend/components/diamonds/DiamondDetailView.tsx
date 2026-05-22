"use client";

import { useEffect, useState } from "react";
import type { Diamond } from "./types";
import { DiamondViewer } from "./DiamondViewer";
import { diamondImageUrl } from "@/lib/diamondImage";

type ImgStage = "resolver" | "placeholder";

type Props = {
  diamond: Diamond | null;
  diamondId: string | null;
  currency: string;
  onBack: () => void;
  onAddToCart?: (d: Diamond) => void;
  busyAddId?: string | null;
};

function capFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatTitle(d: Diamond): string {
  const ct = Number(d.carat || 0).toFixed(2);
  const shape = d.shape ? capFirst(d.shape) : "";
  return `${ct}ct ${shape ? shape + " " : ""}Diamond`.trim();
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

function certLabel(lab: string | undefined | null) {
  const v = (lab || "").trim();
  if (!v || v.toLowerCase() === "no-cert") return null;
  const u = v.toUpperCase();
  if (["GIA", "IGI", "HRD"].includes(u)) return `${u} Certified`;
  return `${v} Certified`;
}

export function DiamondDetailView({
  diamond,
  diamondId,
  currency,
  onBack,
  onAddToCart,
  busyAddId,
}: Props) {
  const [imgStage, setImgStage] = useState<ImgStage>(() =>
    diamond?.id ? "resolver" : "placeholder"
  );
  const [viewerOpen, setViewerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  useEffect(() => {
    setImgStage(diamond?.id ? "resolver" : "placeholder");
    setViewerOpen(false);
  }, [diamond?.id]);

  if (!diamond) {
    return (
      <div className="ds-detail">
        <button type="button" className="ds-detail__back" onClick={onBack}>
          ← Back to browse
        </button>
        <div className="ds-detail__missing">
          <h2>Diamond unavailable</h2>
          <p>
            The diamond you&apos;re looking for{diamondId ? ` (${diamondId})` : ""} isn&apos;t
            in the current catalog. Head back and try again.
          </p>
        </div>
      </div>
    );
  }

  const d = diamond;
  const title = formatTitle(d);
  const cert = certLabel(d.lab);

  const segments: { k: string; v: string }[] = [];
  if (d.color) segments.push({ k: "Color", v: d.color });
  if (d.clarity) segments.push({ k: "Clarity", v: d.clarity });
  if (d.cut) segments.push({ k: "Cut", v: d.cut });

  const handleCopyStock = () => {
    if (!d.stockNum) return;
    navigator.clipboard?.writeText(d.stockNum).catch(() => {});
  };

  // Full diamond spec list, mirroring the app's "Diamond details" table.
  // Missing/unknown values render as an em-dash (matches the app).
  const dash = "—";
  const certName = (() => {
    const v = (d.lab || "").trim();
    if (!v || v.toLowerCase() === "no-cert") return dash;
    return ["GIA", "IGI", "HRD"].includes(v.toUpperCase()) ? v.toUpperCase() : v;
  })();
  const specs: [string, string][] = [
    ["Type", "Lab Grown Diamond"],
    ["Shape", d.shape ? capFirst(d.shape) : dash],
    ["Carat", d.carat ? String(d.carat) : dash],
    ["Colour", d.color || dash],
    ["Clarity", d.clarity || dash],
    ["Cut", d.cut || dash],
    ["Polish", d.polish || dash],
    ["Symmetry", d.symmetry || dash],
    ["Certificate", certName],
    ["Stock Number", d.stockNum || dash],
    ["Measurements", d.measurements || dash],
  ];
  const expertHref = `mailto:hello@astreylla.example?subject=${encodeURIComponent(
    `Diamond enquiry — ${d.stockNum || title}`
  )}`;

  return (
    <div className="ds-detail">
      <button type="button" className="ds-detail__back" onClick={onBack}>
        ← Back to browse
      </button>

      <div className="ds-detail__layout">
        <div className="ds-detail__media">
          {imgStage === "resolver" ? (
            <img
              src={diamondImageUrl(d.id)}
              alt={title}
              onError={() => setImgStage("placeholder")}
            />
          ) : (
            <div className="ds-detail__placeholder" aria-hidden>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 3 L18 3 L21 9 L12 21 L3 9 Z"
                  stroke="#c9a961"
                  strokeWidth="1.2"
                  fill="rgba(201,169,97,0.08)"
                />
              </svg>
            </div>
          )}
          {d.stockNum ? (
            <button
              type="button"
              className="ds-detail__360"
              onClick={() => setViewerOpen(true)}
              aria-label="Open 360° viewer"
            >
              360°
            </button>
          ) : null}
        </div>

        <div className="ds-detail__panel">
          <h2 className="ds-detail__title">{title}</h2>

          {segments.length ? (
            <div className="ds-detail__row">
              {segments.map((s, i) => (
                <span key={s.k}>
                  {i > 0 ? " · " : ""}
                  <span className="ds-detail__seg-k">{s.k}</span>{" "}
                  <span className="ds-detail__seg-v">{s.v}</span>
                </span>
              ))}
            </div>
          ) : null}

          <div className="ds-detail__row">Ships in 5-7 business days</div>

          {cert ? (
            <div className="ds-detail__cert">
              <div className="ds-detail__cert-title">{cert}</div>
              {d.stockNum ? (
                <div className="ds-detail__cert-stock">
                  <span>Stock Number {d.stockNum}</span>
                  <button
                    type="button"
                    className="ds-detail__cert-copy"
                    onClick={handleCopyStock}
                    aria-label="Copy stock number"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M5 15 L5 5 a 1 1 0 0 1 1 -1 L15 4" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="ds-detail__price-row">
            <div className="ds-detail__price-label">
              <strong>Price</strong>
              <span>Price only for diamond</span>
            </div>
            <div className="ds-detail__price-val">
              {formatMoney(d.price || 0, currency)}
            </div>
          </div>

          <button
            type="button"
            className="ds-detail__cta"
            onClick={() => onAddToCart?.(d)}
            disabled={busyAddId === d.id}
          >
            {busyAddId === d.id ? "Adding…" : "Add to cart"}
          </button>

          <a className="ds-detail__cta ds-detail__cta--ghost" href={expertHref}>
            Talk to an expert
          </a>

          <div className="ds-detail__specs">
            <button
              type="button"
              className="ds-detail__specs-head"
              onClick={() => setDetailsOpen((o) => !o)}
              aria-expanded={detailsOpen}
            >
              <span>Diamond details</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                style={{
                  transform: detailsOpen ? "rotate(180deg)" : "none",
                  transition: "transform 200ms ease",
                }}
              >
                <path
                  d="M6 9 L12 15 L18 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {detailsOpen ? (
              <dl className="ds-detail__specs-list">
                {specs.map(([k, v]) => (
                  <div className="ds-detail__spec-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
      <DiamondViewer
        stockNum={d.stockNum}
        shape={d.shape}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
