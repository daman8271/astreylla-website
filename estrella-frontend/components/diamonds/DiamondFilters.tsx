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
import { ShapeMaskIcon, type ShapeName } from "../nav/ShapeMaskIcon";

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
  // --- Advanced filters ---
  table: [number, number];
  ratio: [number, number];
  polishRange: [number, number];
  symmetryRange: [number, number];
  fluorescenceRange: [number, number];
  certificate: string[];
  // --- Fancy Color filters ---
  fancyColor: string[];
  fancyColorIntensity: string[];
  fancyColorOvertone: string[];
};

export const DEFAULT_FILTERS: FilterState = {
  treatment: "", // empty = no upstream filter; tabs still visually default to Natural via UI logic
  shape: "",
  carat: [CARAT_MIN, CARAT_MAX],
  colorRange: [0, COLORS.length - 1], // full range = no filter
  clarityRange: [0, CLARITIES.length - 1],
  cutRange: [0, CUTS.length - 1],
  price: [PRICE_MIN, PRICE_MAX],
  // --- Advanced filters ---
  table: [0, 100],
  ratio: [0.8, 3.0],
  polishRange: [0, 2],
  symmetryRange: [0, 2],
  fluorescenceRange: [0, 4],
  certificate: [],
  // --- Fancy Color filters ---
  fancyColor: [],
  fancyColorIntensity: [],
  fancyColorOvertone: [],
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  mode?: "default" | "ring-studio" | "fancy";
  onModeChange?: (m: "default" | "fancy") => void;
};

export function DiamondFilters({ value, onChange, mode, onModeChange }: Props) {
  const isFancy = mode === "fancy";
  const [showMoreShapes, setShowMoreShapes] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...value, [k]: v });

  const allShapes = showMoreShapes
    ? [...SHAPES_PRIMARY, ...SHAPES_MORE]
    : SHAPES_PRIMARY;

  const colorLabels = COLORS.slice(0, 5).slice().reverse(); // H G F E D under track
  const clarityLabels = CLARITIES.slice(); // VS2 → FL
  const cutLabels = CUTS.slice(); // Very Good → Ideal

  const polishLabels = ["Good", "Very Good", "Excellent"];
  const symmetryLabels = ["Good", "Very Good", "Excellent"];
  const fluorescenceLabels = ["None", "Faint", "Medium", "Strong", "Very Strong"];

const FANCY_COLORS = [
  { label: "Yellow",     from: "#fadf66", to: "#e8c044" },
  { label: "Pink",       from: "#ffccd5", to: "#ec97b3" },
  { label: "Blue",       from: "#729fcf", to: "#2f5fb5" },
  { label: "Red",        from: "#e74c4c", to: "#a82a2a" },
  { label: "Green",      from: "#7fc06d", to: "#3f8a4a" },
  { label: "Purple",     from: "#a07cc8", to: "#6c4ba0" },
  { label: "Orange",     from: "#ff9f43", to: "#ee5253" },
  { label: "Violet",     from: "#b28dff", to: "#8a2be2" },
  { label: "Gray",       from: "#a9a9a9", to: "#808080" },
  { label: "Black",      from: "#2b2b2b", to: "#000000" },
  { label: "Brown",      from: "#a0522d", to: "#8b4513" },
  { label: "Champagne",  from: "#fad09e", to: "#e8a75e" },
  { label: "Cognac",     from: "#c46210", to: "#96300a" },
  { label: "Chameleon",  from: "#8fbc8f", to: "#556b2f" },
  { label: "White",      from: "#ffffff", to: "#e0e0e0" },
  { label: "S & P",      from: "#c0c0c0", to: "#708090" },
  { label: "Other",      from: "#dfd2c0", to: "#b3a290" },
];

const OVERTONES = [
  "None", "Yellow", "Yellowish", "Pink", "Pinkish", "Blue", "Blueish", "Red", "Reddish", "Green", "Greenish", "Purple"
];

const INTENSITIES = [
  "Fancy Deep", "Fancy Vivid", "Fancy Intense", "Fancy Dark", "Fancy", "Fancy Light", "Light", "Very Light", "Faint"
];

  return (
    <section className="ds-filters" aria-label="Filter diamonds">
      <div className="ds-filters__grid">
        {/* LEFT COLUMN */}
        <div className="ds-filters__col">
          <div className="ds-field">
            <label className="ds-field__label">Shape</label>
            <div className="ds-shape-row">
              {allShapes.map((shape) => {
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
                      <ShapeMaskIcon name={shape.toLowerCase() as ShapeName} size={36} />
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

          {!isFancy && (
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
          )}
          {isFancy && (
            <>
              <div className="ds-field">
                <label className="ds-field__label">Fancy Colour</label>
                <div className="ds-fancy-colors-grid">
                  {FANCY_COLORS.map((c) => {
                    const active = value.fancyColor.includes(c.label);
                    return (
                      <button
                        key={c.label}
                        type="button"
                        className={`ds-fancy-color-btn ${active ? "ds-fancy-color-btn--active" : ""}`}
                        onClick={() => {
                          if (active) {
                            set("fancyColor", value.fancyColor.filter((x) => x !== c.label));
                          } else {
                            set("fancyColor", [...value.fancyColor, c.label]);
                          }
                        }}
                        title={c.label}
                      >
                        <span
                          className="ds-fancy-color-circle"
                          style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                        />
                        <span className="ds-fancy-color-label">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ds-field" style={{ marginTop: "8px" }}>
                <label className="ds-field__label">Overtone</label>
                <div className="ds-fancy-overtones-grid">
                  {OVERTONES.map((o) => {
                    const active = value.fancyColorOvertone.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        className={`ds-fancy-chip ${active ? "ds-fancy-chip--active" : ""}`}
                        onClick={() => {
                          if (active) {
                            set("fancyColorOvertone", value.fancyColorOvertone.filter((x) => x !== o));
                          } else {
                            set("fancyColorOvertone", [...value.fancyColorOvertone, o]);
                          }
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

            </>
          )}

          {!isFancy && (
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
          )}
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

          {/* Intensity + Cut — fancy mode only, rendered in right col below Price */}
          {isFancy && (
            <>
              <div className="ds-field">
                <label className="ds-field__label">Intensity</label>
                <div className="ds-fancy-intensities-grid">
                  {INTENSITIES.map((i) => {
                    const active = value.fancyColorIntensity.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`ds-fancy-chip ${active ? "ds-fancy-chip--active" : ""}`}
                        onClick={() => {
                          if (active) {
                            set("fancyColorIntensity", value.fancyColorIntensity.filter((x) => x !== i));
                          } else {
                            set("fancyColorIntensity", [...value.fancyColorIntensity, i]);
                          }
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
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
            </>
          )}
        </div>
      </div>

      {/* COLLAPSIBLE ADVANCED FILTERS SECTION */}
      <div className="ds-filters__advanced-trigger">
        <button
          type="button"
          className="ds-advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
        >
          <span>Advanced Filters</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
            aria-hidden
          >
            <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {showAdvanced && (
        <div className="ds-filters__grid ds-filters__advanced-grid">
          {/* LEFT COLUMN */}
          <div className="ds-filters__col">
            {/* Table Slider */}
            <div className="ds-field">
              <label className="ds-field__label">Table</label>
              <RangeSlider
                min={0}
                max={100}
                step={1}
                value={value.table}
                onChange={(v) => set("table", v)}
                label="Table"
              />
              <div className="ds-input-row">
                <div className="ds-input-suffix">
                  <input
                    type="number"
                    min={0}
                    max={value.table[1]}
                    value={value.table[0]}
                    onChange={(e) =>
                      set("table", [
                        Math.max(0, Math.min(Number(e.target.value), value.table[1])),
                        value.table[1],
                      ])
                    }
                  />
                  <span className="ds-input-suffix__unit">%</span>
                </div>
                <span className="ds-input-row__sep" aria-hidden>—</span>
                <div className="ds-input-suffix">
                  <input
                    type="number"
                    min={value.table[0]}
                    max={100}
                    value={value.table[1]}
                    onChange={(e) =>
                      set("table", [
                        value.table[0],
                        Math.min(100, Math.max(Number(e.target.value), value.table[0])),
                      ])
                    }
                  />
                  <span className="ds-input-suffix__unit">%</span>
                </div>
              </div>
            </div>

            {/* Polish Slider */}
            <div className="ds-field">
              <label className="ds-field__label">Polish</label>
              <RangeSlider
                min={0}
                max={2}
                step={1}
                value={value.polishRange}
                onChange={(v) => set("polishRange", v)}
                label="Polish"
              />
              <div className="ds-scale ds-scale--3">
                {polishLabels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            {/* Fluorescence Slider */}
            <div className="ds-field">
              <label className="ds-field__label">Fluorescence</label>
              <RangeSlider
                min={0}
                max={4}
                step={1}
                value={value.fluorescenceRange}
                onChange={(v) => set("fluorescenceRange", v)}
                label="Fluorescence"
              />
              <div className="ds-scale ds-scale--5">
                {fluorescenceLabels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="ds-filters__col">
            {/* Ratio Slider */}
            <div className="ds-field">
              <label className="ds-field__label">Ratio</label>
              <RangeSlider
                min={0.8}
                max={3.0}
                step={0.1}
                value={value.ratio}
                onChange={(v) => set("ratio", v)}
                label="Ratio"
              />
              <div className="ds-input-row">
                <input
                  type="number"
                  step="0.1"
                  min={0.8}
                  max={value.ratio[1]}
                  value={value.ratio[0]}
                  onChange={(e) =>
                    set("ratio", [
                      Math.max(0.8, Math.min(Number(e.target.value), value.ratio[1])),
                      value.ratio[1],
                    ])
                  }
                />
                <span className="ds-input-row__sep" aria-hidden>—</span>
                <input
                  type="number"
                  step="0.1"
                  min={value.ratio[0]}
                  max={3.0}
                  value={value.ratio[1]}
                  onChange={(e) =>
                    set("ratio", [
                      value.ratio[0],
                      Math.min(3.0, Math.max(Number(e.target.value), value.ratio[0])),
                    ])
                  }
                />
              </div>
            </div>

            {/* Symmetry Slider */}
            <div className="ds-field">
              <label className="ds-field__label">Symmetry</label>
              <RangeSlider
                min={0}
                max={2}
                step={1}
                value={value.symmetryRange}
                onChange={(v) => set("symmetryRange", v)}
                label="Symmetry"
              />
              <div className="ds-scale ds-scale--3">
                {symmetryLabels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            {/* Certificate Toggles */}
            <div className="ds-field">
              <label className="ds-field__label">Certificate</label>
              <div className="ds-cert-toggle-row">
                {["GIA", "IGI"].map((cert) => {
                  const active = value.certificate.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      className={`ds-cert-toggle-btn ${active ? "ds-cert-toggle-btn--active" : ""}`}
                      onClick={() => {
                        if (active) {
                          set("certificate", value.certificate.filter((c) => c !== cert));
                        } else {
                          set("certificate", [...value.certificate, cert]);
                        }
                      }}
                    >
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
