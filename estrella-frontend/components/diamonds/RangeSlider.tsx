"use client";

import { useCallback, useId, useMemo } from "react";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
};

/**
 * Dual-thumb range slider built from two stacked native <input type="range">.
 * The active segment between the thumbs is rendered as a dark fill on the
 * shared track; the inactive segments are light gray. Matches the look of
 * the reference screenshot — thick rounded track, small dark thumbs.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
}: RangeSliderProps) {
  const id = useId();
  const [lo, hi] = value;

  const pct = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max]
  );

  const trackStyle = useMemo<React.CSSProperties>(
    () => ({
      background: `linear-gradient(
        to right,
        #e5e2da 0%,
        #e5e2da ${pct(lo)}%,
        #1a1a1a ${pct(lo)}%,
        #1a1a1a ${pct(hi)}%,
        #e5e2da ${pct(hi)}%,
        #e5e2da 100%
      )`,
    }),
    [lo, hi, pct]
  );

  const handleLo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), hi);
    onChange([v, hi]);
  };
  const handleHi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), lo);
    onChange([lo, v]);
  };

  const showTicks = step === 1 && (max - min) <= 10;
  const ticks = useMemo(() => {
    if (!showTicks) return [];
    const arr = [];
    const count = max - min;
    for (let i = 0; i <= count; i++) {
      const val = min + i;
      const active = val >= lo && val <= hi;
      arr.push({
        pct: (i / count) * 100,
        active,
        val,
      });
    }
    return arr;
  }, [min, max, step, lo, hi, showTicks]);

  return (
    <div className="ds-range" aria-label={label}>
      <div className="ds-range__track" style={trackStyle} />
      
      {showTicks && (
        <div className="ds-range__ticks" aria-hidden="true">
          {ticks.map((t, idx) => (
            <div
              key={idx}
              className={`ds-range__tick ${t.active ? "ds-range__tick--active" : ""}`}
              style={{ left: `${t.pct}%` }}
            />
          ))}
        </div>
      )}

      <input
        id={`${id}-lo`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={handleLo}
        aria-label={label ? `${label} minimum` : "minimum"}
        className="ds-range__input"
      />
      <input
        id={`${id}-hi`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={handleHi}
        aria-label={label ? `${label} maximum` : "maximum"}
        className="ds-range__input"
      />
    </div>
  );
}
