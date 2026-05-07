"use client";

import { useState } from "react";
import {
  CARAT_MAX,
  CARAT_MIN,
  CLARITIES,
  COLORS,
  CUTS,
  PRICE_MAX,
  PRICE_MIN,
  SHAPES_MORE,
  SHAPES_PRIMARY,
  Treatment,
} from "./types";
import { RangeSlider } from "./RangeSlider";
import { SHAPE_ICONS } from "./ShapeIcons";

export type FilterState = {
  treatment: Treatment;
  shape: string;
  carat: [number, number];
  // colour and clarity sliders use INDEX positions into their arrays.
  // For colour the array order is D..K (best→worst); slider visually goes
  // H→D (worst→best on the right) so we map at the wire layer.
  colorRange: [number, number];
  clarityRange: [number, number];
  cutRange: [number, number];
  price: [number, number];
};

export const DEFAULT_FILTERS: FilterState = {
  treatment: "", // empty = no upstream filter; tabs still visually default to Natural via UI logic
  shape: "",
  carat: [CARAT_MIN, CARAT_MAX],
  colorRange: [0, COLORS.length - 1], // full range = no filter
  clarityRange: [0, CLARITIES.length - 1],
  cutRange: [0, CUTS.length - 1],
  price: [PRICE_MIN, PRICE_MAX],
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
};

export function DiamondFilters({ value, onChange }: Props) {
  const [showMoreShapes, setShowMoreShapes] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...value, [k]: v });

  const allShapes = showMoreShapes
    ? [...SHAPES_PRIMARY, ...SHAPES_MORE]
    : SHAPES_PRIMARY;

  const colorLabels = COLORS.slice(0, 5).slice().reverse(); // H G F E D under track
  const clarityLabels = CLARITIES.slice(); // VS2 → FL
  const cutLabels = CUTS.slice(); // Very Good → Ideal

  return (
    <section className="ds-filters" aria-label="Filter diamonds">
      <div className="ds-tabs" role="tablist">
        {/* Natural is the visual default — empty string ("") and "natural"
            both render the Natural tab as active. The empty case skips the
            upstream filter so the catalog isn't restricted on first load. */}
        <button
          role="tab"
          aria-selected={value.treatment !== "lab-grown"}
          className={`ds-tab ${value.treatment !== "lab-grown" ? "ds-tab--active" : ""}`}
          onClick={() => set("treatment", "natural")}
        >
          Natural
        </button>
        <button
          role="tab"
          aria-selected={value.treatment === "lab-grown"}
          className={`ds-tab ${value.treatment === "lab-grown" ? "ds-tab--active" : ""}`}
          onClick={() => set("treatment", "lab-grown")}
        >
          Lab Grown
        </button>
      </div>

      <div className="ds-filters__grid">
        {/* LEFT COLUMN */}
        <div className="ds-filters__col">
          <div className="ds-field">
            <label className="ds-field__label">Shape</label>
            <div className="ds-shape-row">
              {allShapes.map((shape) => {
                const Icon = SHAPE_ICONS[shape];
                const active = value.shape === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    className={`ds-shape ${active ? "ds-shape--active" : ""}`}
                    onClick={() => set("shape", active ? "" : shape)}
                    aria-pressed={active}
                  >
                    <span className="ds-shape__icon">
                      {Icon ? <Icon size={28} /> : null}
                    </span>
                    <span className="ds-shape__label">{shape}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="ds-more-shapes"
              onClick={() => setShowMoreShapes((s) => !s)}
              aria-expanded={showMoreShapes}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d={showMoreShapes ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{showMoreShapes ? "Less Shapes" : "More Shapes"}</span>
            </button>
          </div>

          <div className="ds-field">
            <label className="ds-field__label">Colour</label>
            <RangeSlider
              min={0}
              max={4}
              step={1}
              value={value.colorRange}
              onChange={(v) => set("colorRange", v)}
              label="Colour"
            />
            <div className="ds-scale">
              {colorLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-field__label">Cut</label>
            <RangeSlider
              min={0}
              max={cutLabels.length - 1}
              step={1}
              value={value.cutRange}
              onChange={(v) => set("cutRange", v)}
              label="Cut"
            />
            <div className="ds-scale ds-scale--3">
              {cutLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ds-filters__col">
          <div className="ds-field">
            <label className="ds-field__label">Carats</label>
            <RangeSlider
              min={CARAT_MIN}
              max={CARAT_MAX}
              step={0.1}
              value={value.carat}
              onChange={(v) => set("carat", v)}
              label="Carats"
            />
            <div className="ds-input-row">
              <div className="ds-input-suffix">
                <input
                  type="number"
                  step="0.1"
                  min={CARAT_MIN}
                  max={value.carat[1]}
                  value={value.carat[0]}
                  onChange={(e) =>
                    set("carat", [
                      Math.max(CARAT_MIN, Math.min(Number(e.target.value), value.carat[1])),
                      value.carat[1],
                    ])
                  }
                />
                <span className="ds-input-suffix__unit">ct</span>
              </div>
              <div className="ds-input-suffix">
                <input
                  type="number"
                  step="0.1"
                  min={value.carat[0]}
                  max={CARAT_MAX}
                  value={value.carat[1]}
                  onChange={(e) =>
                    set("carat", [
                      value.carat[0],
                      Math.min(CARAT_MAX, Math.max(Number(e.target.value), value.carat[0])),
                    ])
                  }
                />
                <span className="ds-input-suffix__unit">ct</span>
              </div>
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-field__label">Clarity</label>
            <RangeSlider
              min={0}
              max={clarityLabels.length - 1}
              step={1}
              value={value.clarityRange}
              onChange={(v) => set("clarityRange", v)}
              label="Clarity"
            />
            <div className="ds-scale ds-scale--6">
              {clarityLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-field__label">Price</label>
            <RangeSlider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1}
              value={value.price}
              onChange={(v) => set("price", v)}
              label="Price"
            />
            <div className="ds-input-row">
              <div className="ds-input-prefix">
                <span className="ds-input-prefix__sym">$</span>
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={value.price[1]}
                  value={value.price[0]}
                  onChange={(e) =>
                    set("price", [
                      Math.max(PRICE_MIN, Math.min(Number(e.target.value), value.price[1])),
                      value.price[1],
                    ])
                  }
                />
              </div>
              <span className="ds-input-row__sep" aria-hidden>—</span>
              <div className="ds-input-prefix">
                <span className="ds-input-prefix__sym">$</span>
                <input
                  type="number"
                  min={value.price[0]}
                  max={PRICE_MAX}
                  value={value.price[1]}
                  onChange={(e) =>
                    set("price", [
                      value.price[0],
                      Math.min(PRICE_MAX, Math.max(Number(e.target.value), value.price[0])),
                    ])
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="ds-advanced"
        onClick={() => setAdvancedOpen((s) => !s)}
        aria-expanded={advancedOpen}
      >
        <span>Advanced Filters</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d={advancedOpen ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {advancedOpen ? (
        <div className="ds-advanced__panel">
          <p className="ds-advanced__placeholder">
            Polish, symmetry, fluorescence, and certificate filters coming soon.
          </p>
        </div>
      ) : null}
    </section>
  );
}
