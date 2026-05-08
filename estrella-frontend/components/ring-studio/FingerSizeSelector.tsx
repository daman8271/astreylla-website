"use client";

import { REGIONS, type RegionCode, getRegion } from "@/lib/ringSizes";

type Props = {
  region: RegionCode | null;
  size: { label: string; value: string } | null;
  onChange: (region: RegionCode | null, size: { label: string; value: string } | null) => void;
};

export function FingerSizeSelector({ region, size, onChange }: Props) {
  const sizes = region ? getRegion(region)?.sizes ?? [] : [];

  return (
    <div className="rs-finger-size">
      <span className="rs-finger-size__icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="9" width="18" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 9 L6 12 M9 9 L9 13 M12 9 L12 12 M15 9 L15 13 M18 9 L18 12" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <div className="rs-finger-size__body">
        <h3 className="rs-finger-size__title">Finger Size</h3>
        <p className="rs-finger-size__copy">
          If you don&apos;t know the ring size, please select the &quot;Not sure&quot; option and a standard ring size will be used.
        </p>
        <div className="rs-finger-size__row">
          <label className="rs-finger-size__select">
            <select
              value={region || ""}
              onChange={(e) => {
                const next = e.target.value as RegionCode | "";
                onChange(next || null, null);
              }}
            >
              <option value="">Select Region</option>
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="rs-finger-size__select">
            <select
              value={size?.value || ""}
              disabled={!region}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  onChange(region, null);
                  return;
                }
                const found = sizes.find((s) => s.value === v) || { label: v, value: v };
                onChange(region, { label: found.label, value: found.value });
              }}
            >
              <option value="">Select Ring Size</option>
              {sizes.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
