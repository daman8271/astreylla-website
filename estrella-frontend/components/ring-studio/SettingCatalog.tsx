"use client";

import { useMemo, useState } from "react";
import { SettingCard } from "./SettingCard";
import { SettingFilters, DEFAULT_SETTING_FILTERS, PRICE_FLOOR, PRICE_CEIL, type SettingFilterState } from "./SettingFilters";
import { filterSettings } from "@/lib/settings";

type SortKey = "featured" | "price-asc" | "price-desc";

type Props = {
  shape: string | null;
  onOpenSetting: (sku: string) => void;
};

export function SettingCatalog({ shape, onOpenSetting }: Props) {
  const [filters, setFilters] = useState<SettingFilterState>(DEFAULT_SETTING_FILTERS);
  const [hidden, setHidden] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const list = useMemo(() => {
    const base = filterSettings({
      shape,
      styles: filters.styles,
      metalKeys: filters.metalKeys,
      priceMin: filters.priceRange[0] > PRICE_FLOOR ? filters.priceRange[0] : undefined,
      priceMax: filters.priceRange[1] < PRICE_CEIL ? filters.priceRange[1] : undefined,
    });
    if (sort === "price-asc") return base.slice().sort((a, b) => a.basePriceUsd - b.basePriceUsd);
    if (sort === "price-desc") return base.slice().sort((a, b) => b.basePriceUsd - a.basePriceUsd);
    return base;
  }, [filters, shape, sort]);

  const activeCount =
    (filters.styles.size > 0 ? 1 : 0) +
    (filters.metalKeys.size > 0 ? 1 : 0) +
    (filters.priceRange[0] > PRICE_FLOOR || filters.priceRange[1] < PRICE_CEIL ? 1 : 0);

  return (
    <div className="rs-setting-catalog">
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
          <SettingCard key={s.sku} setting={s} onClick={() => onOpenSetting(s.sku)} />
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
