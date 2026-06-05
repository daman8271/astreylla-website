"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SettingCard } from "./SettingCard";
import { SettingFilters, DEFAULT_SETTING_FILTERS, PRICE_FLOOR, PRICE_CEIL, type SettingFilterState } from "./SettingFilters";
import { filterSettings } from "@/lib/settings";
import type { Setting, SettingStyle } from "./setting-types";

type SortKey = "featured" | "price-asc" | "price-desc";

type Props = {
  shape: string | null;
  onOpenSetting: (sku: string) => void;
  customSettings?: Setting[];
};

export function SettingCatalog({ shape, onOpenSetting, customSettings }: Props) {
  const [filters, setFilters] = useState<SettingFilterState>(DEFAULT_SETTING_FILTERS);
  const [hidden, setHidden] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const searchParams = useSearchParams();
  const lastParamsRef = useRef<string>("");

  // Sync URL search parameters to catalog filters
  useEffect(() => {
    const paramsStr = searchParams.toString();
    if (paramsStr === lastParamsRef.current) return;
    lastParamsRef.current = paramsStr;

    const nextFilters: SettingFilterState = {
      styles: new Set<SettingStyle>(),
      metalKeys: new Set<string>(),
      shapes: new Set<string>(),
      priceRange: [PRICE_FLOOR, PRICE_CEIL],
    };

    const shapesParam = searchParams.get("shapes") || searchParams.get("shape");
    if (shapesParam) {
      shapesParam.split(",").forEach((s) => {
        if (s) nextFilters.shapes.add(s);
      });
    }

    const stylesParam = searchParams.get("styles") || searchParams.get("style");
    if (stylesParam) {
      stylesParam.split(",").forEach((s) => {
        if (s) nextFilters.styles.add(s as SettingStyle);
      });
    }

    const metalsParam = searchParams.get("metalKeys") || searchParams.get("metal");
    if (metalsParam) {
      metalsParam.split(",").forEach((m) => {
        if (m) nextFilters.metalKeys.add(m);
      });
    }

    setFilters(nextFilters);
  }, [searchParams]);

  const list = useMemo(() => {
    const base = filterSettings({
      shape,
      shapes: filters.shapes,
      styles: filters.styles,
      metalKeys: filters.metalKeys,
      priceMin: filters.priceRange[0] > PRICE_FLOOR ? filters.priceRange[0] : undefined,
      priceMax: filters.priceRange[1] < PRICE_CEIL ? filters.priceRange[1] : undefined,
    }, customSettings);
    if (sort === "price-asc") return base.slice().sort((a, b) => a.basePriceUsd - b.basePriceUsd);
    if (sort === "price-desc") return base.slice().sort((a, b) => b.basePriceUsd - a.basePriceUsd);
    return base;
  }, [filters, shape, sort, customSettings]);

  // The metal filter is keyed by "{karat}-{color}". Reduce to the set of chosen
  // colors so each card can render in the selected metal colour.
  const selectedColors = useMemo(() => {
    const colors = new Set<string>();
    filters.metalKeys.forEach((key) => {
      const color = key.split("-")[1];
      if (color) colors.add(color);
    });
    return colors;
  }, [filters.metalKeys]);

  const activeCount =
    (filters.styles.size > 0 ? 1 : 0) +
    (filters.metalKeys.size > 0 ? 1 : 0) +
    (filters.shapes.size > 0 ? 1 : 0) +
    (filters.priceRange[0] > PRICE_FLOOR || filters.priceRange[1] < PRICE_CEIL ? 1 : 0);

  const isEngagement = searchParams.get("category")?.toLowerCase() === "engagement";

  return (
    <div className="rs-setting-catalog">
      {isEngagement && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "rgba(181, 154, 111, 0.08)",
          border: "1px solid rgba(181, 154, 111, 0.25)",
          color: "var(--brand-accent-gold, #b59a6f)",
          padding: "12px 18px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontFamily: "var(--font-sans, system-ui), sans-serif",
          fontSize: "13.5px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          lineHeight: "1.4",
        }}>
          <span style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--brand-accent-gold, #b59a6f)",
            boxShadow: "0 0 0 4px rgba(181, 154, 111, 0.2)",
            flexShrink: 0
          }} />
          <span>Active collection: <strong>Engagement rings</strong> option is selected</span>
        </div>
      )}

      <SettingFilters
        value={filters}
        onChange={setFilters}
        lockedShape={shape}
        hidden={hidden}
        onToggleHide={() => setHidden((h) => !h)}
        onClearAll={() => setFilters(DEFAULT_SETTING_FILTERS)}
        activeCount={activeCount}
      />

      <div className="rs-setting-sort">
        <label>
          <span>Sort order:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="rs-setting-grid">
        {list.map((s) => (
          <SettingCard
            key={s.sku}
            setting={s}
            selectedColors={selectedColors}
            onClick={() => onOpenSetting(s.sku)}
          />
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rs-setting-empty">
          No settings match these filters. Try widening your criteria.
        </div>
      ) : null}
    </div>
  );
}
