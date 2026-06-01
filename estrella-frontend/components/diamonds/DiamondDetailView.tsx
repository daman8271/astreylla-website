"use client";

import { useEffect, useState, useMemo } from "react";
import type { Diamond } from "./types";
import { DiamondViewer } from "./DiamondViewer";
import { diamondImageUrl } from "@/lib/diamondImage";
import { useCurrency } from "@/components/currency/CurrencyContext";

type ImgStage = "resolver" | "placeholder";

type Props = {
  diamond: Diamond | null;
  diamondId: string | null;
  onBack: () => void;
  onAddToCart?: (d: Diamond) => void;
  busyAddId?: string | null;
  mode?: "default" | "ring-studio";
  onSelect?: (d: Diamond) => void;
  shop?: string;
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
  onBack,
  onAddToCart,
  busyAddId,
  mode = "default",
  onSelect,
  shop,
}: Props) {
  const { formatPrice } = useCurrency();
  const [localDiamond, setLocalDiamond] = useState<Diamond | null>(diamond);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [imgStage, setImgStage] = useState<ImgStage>(() =>
    diamond?.id ? "resolver" : "placeholder"
  );
  const [viewerOpen, setViewerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setLocalDiamond(diamond);
  }, [diamond]);

  useEffect(() => {
    setImgStage(localDiamond?.id ? "resolver" : "placeholder");
    setViewerOpen(false);
    setActiveTab(0);
  }, [localDiamond?.id]);

  useEffect(() => {
    if (localDiamond || !diamondId || !shop) return;

    let active = true;
    setFetching(true);
    setFetchError(null);

    const fetchSingle = async () => {
      try {
        const url = `/api/widget/api/public/diamonds?shop=${encodeURIComponent(shop)}&id=${encodeURIComponent(diamondId)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!active) return;
        const rows = data.diamonds || [];
        if (rows.length > 0) {
          setLocalDiamond(rows[0]);
        } else {
          setFetchError("The diamond is no longer available in the catalogue.");
        }
      } catch (e) {
        if (!active) return;
        setFetchError("Failed to load diamond details. Please try again.");
      } finally {
        if (active) setFetching(false);
      }
    };

    fetchSingle();
    return () => {
      active = false;
    };
  }, [diamondId, shop, localDiamond]);

  const galleryItems = useMemo(() => {
    if (!localDiamond || !localDiamond.id) return [];

    const items: Array<{
      id: string;
      type: "image" | "video" | "360";
      url: string;
      label: string;
    }> = [
      {
        id: "front",
        type: "image" as const,
        url: diamondImageUrl(localDiamond.id),
        label: "Front View",
      },
      {
        id: "side",
        type: "image" as const,
        url: `https://augmont-lgd-prod.b-cdn.net/products/${localDiamond.id}/image/64.jpg`,
        label: "Side View",
      },
      {
        id: "back",
        type: "image" as const,
        url: `https://augmont-lgd-prod.b-cdn.net/products/${localDiamond.id}/image/128.jpg`,
        label: "Back View",
      },
    ];

    if (localDiamond.stockNum) {
      items.push({
        id: "360",
        type: "360" as const,
        url: `/360-viewer.html?id=${encodeURIComponent(localDiamond.stockNum)}&type=video`,
        label: "360° View",
      });
    }

    return items;
  }, [localDiamond?.id, localDiamond?.stockNum]);

  if (fetching) {
    return (
      <div className="ds-detail">
        <button type="button" className="ds-detail__back" onClick={onBack}>
          ← Back to browse
        </button>
        <div className="ds-detail__loading">
          <div className="ds-detail__spinner" />
          <p>Loading diamond details...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !localDiamond) {
    return (
      <div className="ds-detail">
        <button type="button" className="ds-detail__back" onClick={onBack}>
          ← Back to browse
        </button>
        <div className="ds-detail__missing">
          <h2>Diamond unavailable</h2>
          <p>
            {fetchError || `The diamond you're looking for${diamondId ? ` (${diamondId})` : ""} isn't in the current catalog. Head back and try again.`}
          </p>
        </div>
      </div>
    );
  }

  const d = localDiamond;
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
        {/* Left Side: Interactive Media Gallery */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "1 1 50%", width: "100%", position: "sticky", top: 90, alignSelf: "flex-start" }} className="ds-detail__gallery-col">
          <div className="ds-detail__media" style={{ width: "100%", margin: 0, position: "relative", top: "auto" }}>
            {galleryItems.length === 0 ? (
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
            ) : galleryItems[activeTab].type === "image" ? (
              <img
                src={galleryItems[activeTab].url}
                alt={title}
                onError={() => {
                  if (activeTab !== 0) setActiveTab(0);
                }}
              />
            ) : galleryItems[activeTab].type === "video" ? (
              <div style={{ width: "100%", height: "100%", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video
                  src={galleryItems[activeTab].url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            ) : (
              <iframe
                src={galleryItems[activeTab].url}
                title="360° Diamond Viewer"
                style={{ width: "100%", height: "100%", border: 0, background: "#ffffff", display: "block" }}
                allow="autoplay; fullscreen"
              />
            )}

            {d.stockNum && galleryItems[activeTab]?.type !== "360" ? (
              <button
                type="button"
                className="ds-detail__360"
                onClick={() => {
                  const idx = galleryItems.findIndex(item => item.type === "360");
                  if (idx !== -1) setActiveTab(idx);
                  else setViewerOpen(true);
                }}
                aria-label="Open 360° view"
              >
                360°
              </button>
            ) : null}
          </div>

          {/* Thumbnail row below main viewer */}
          {galleryItems.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 0" }} className="ds-detail__thumbnails">
              {galleryItems.map((item, idx) => {
                const isActive = idx === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: isActive ? "2px solid #c9a961" : "1px solid rgba(0,0,0,0.08)",
                      background: "#ffffff",
                      padding: 0,
                      cursor: "pointer",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: isActive ? "0 2px 8px rgba(201,169,97,0.2)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.label}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = diamondImageUrl(d.id);
                        }}
                      />
                    ) : item.type === "video" ? (
                      <div style={{ width: "100%", height: "100%", position: "relative", background: "#fbf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={diamondImageUrl(d.id)}
                          alt={item.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.6 }}
                        />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.15)"
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5v14l11-7z" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: "100%", position: "relative", background: "#fbf8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={diamondImageUrl(d.id)}
                          alt={item.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.6 }}
                        />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.15)"
                        }}>
                          <span style={{
                            fontSize: 9,
                            fontWeight: "bold",
                            color: "#ffffff",
                            background: "rgba(0,0,0,0.6)",
                            padding: "2px 4px",
                            borderRadius: 4,
                            fontFamily: "var(--font-sans)",
                            letterSpacing: "0.05em"
                          }}>
                            360°
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
              {formatPrice(d.price || 0)}
            </div>
          </div>

          {mode === "ring-studio" ? (
            <button
              type="button"
              className="ds-detail__cta"
              onClick={() => onSelect?.(d)}
            >
              Select diamond
            </button>
          ) : (
            <button
              type="button"
              className="ds-detail__cta"
              onClick={() => onAddToCart?.(d)}
              disabled={busyAddId === d.id}
            >
              {busyAddId === d.id ? "Adding…" : "Add to cart"}
            </button>
          )}

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
