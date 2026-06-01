"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/currency/CurrencyContext";
import {
  CARAT_MAX,
  CARAT_MIN,
  CLARITIES,
  COLORS,
  CUTS,
  Diamond,
  DiamondsResponse,
  PRICE_MAX,
  PRICE_MIN,
  SortKey,
} from "./types";
import {
  DEFAULT_FILTERS,
  DiamondFilters,
  FilterState,
} from "./DiamondFilters";
import { DiamondCard } from "./DiamondCard";
import { DiamondDetailView } from "./DiamondDetailView";
import { DiamondGridSkeleton } from "./DiamondCardSkeleton";

type Props = {
  shop: string;
  apiBase?: string; // defaults to /api/widget (proxies to Railway)
  perPage?: number;
  mode?: "default" | "ring-studio";
  onSelect?: (d: Diamond) => void;
  initialFilters?: Partial<FilterState>;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "carat-desc", label: "Carat: high to low" },
  { value: "carat-asc", label: "Carat: low to high" },
];

function buildQuery(
  shop: string,
  filters: FilterState,
  pagination: { from: number; to: number; count: boolean }
) {
  const p = new URLSearchParams();
  p.set("shop", shop);

  // Hard rule: only ever surface diamonds that carry BOTH a real image and a
  // 360° video. These are always-on (not user-toggleable) filters honoured by
  // the Express API (`hasImage` / `hasVideo` query params). Without them the
  // catalog shows media-less stones that fall back to the SVG placeholder.
  p.set("hasImage", "true");
  p.set("hasVideo", "true");

  if (filters.shape) p.set("shape", filters.shape);

  // Treatment: API expects 'lab-grown' or 'natural'.
  if (filters.treatment) p.set("treatment", filters.treatment);

  // Colour: slider thumb 0..4 maps onto COLORS[0..4] = D..H. Send only when
  // the slider is narrowed (full range = no filter).
  const [cMin, cMax] = filters.colorRange;
  if (cMin > 0 || cMax < 4) {
    p.set("color", COLORS.slice(cMin, cMax + 1).join(","));
  }
  // Clarity: slider 0..5 = VS2..FL.
  const [clMin, clMax] = filters.clarityRange;
  if (clMin > 0 || clMax < CLARITIES.length - 1) {
    p.set("clarity", CLARITIES.slice(clMin, clMax + 1).join(","));
  }
  // Cut: 0..2 = Very Good / Excellent / Ideal. Map "Ideal" → Excellent
  // because Augmont doesn't expose Ideal.
  const [cutMin, cutMax] = filters.cutRange;
  if (cutMin > 0 || cutMax < CUTS.length - 1) {
    const cuts = CUTS.slice(cutMin, cutMax + 1).map((c) =>
      c === "Ideal" ? "Excellent" : c
    );
    // de-duplicate
    p.set("cut", Array.from(new Set(cuts)).join(","));
  }

  const [caMin, caMax] = filters.carat;
  if (caMin > CARAT_MIN) p.set("minCarat", caMin.toFixed(2));
  if (caMax < CARAT_MAX) p.set("maxCarat", caMax.toFixed(2));

  const [pMin, pMax] = filters.price;
  if (pMin > PRICE_MIN) p.set("minFinalPrice", String(pMin));
  if (pMax < PRICE_MAX) p.set("maxFinalPrice", String(pMax));

  p.set("from", String(pagination.from));
  p.set("to", String(pagination.to));
  if (pagination.count) p.set("count", "true");
  return p.toString();
}

function sortDiamonds(rows: Diamond[], sort: SortKey): Diamond[] {
  if (!sort) return rows;
  const out = rows.slice();
  switch (sort) {
    case "price-asc":
      out.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price-desc":
      out.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "carat-asc":
      out.sort((a, b) => (a.carat || 0) - (b.carat || 0));
      break;
    case "carat-desc":
      out.sort((a, b) => (b.carat || 0) - (a.carat || 0));
      break;
  }
  return out;
}

export function DiamondCatalog({
  shop,
  apiBase = "/api/widget",
  perPage = 12,
  mode = "default",
  onSelect,
  initialFilters,
}: Props) {
  const isRingStudio = mode === "ring-studio";
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...(initialFilters || {}) });
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  // Start in the loading state so the skeleton grid paints immediately on mount
  // (the first-mount effect kicks off the fetch) instead of flashing the empty
  // "no diamonds" message before data arrives.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency } = useCurrency();
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [pagination, setPagination] = useState({ from: 1, to: perPage });
  const [busyAddId, setBusyAddId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pushedHistoryRef = useRef(false);
  const seq = useRef(0);

  const debounceRef = useRef<number | null>(null);
  const refetch = useCallback(
    (resetPage = true) => {
      const newPage = resetPage
        ? { from: 1, to: perPage }
        : pagination;
      const myReq = ++seq.current;
      setLoading(true);
      setError(null);
      const qs = buildQuery(shop, filters, {
        from: newPage.from,
        to: newPage.to,
        count: true,
      });

      // Augmont's catalog upstream is intermittently unavailable and surfaces
      // as a transient 5xx (502/503) that clears within seconds. Auto-retry a
      // few times with backoff before showing the visitor an error, so a brief
      // upstream blip self-heals instead of rendering a hard "HTTP 503".
      const MAX_RETRIES = 2;
      const attempt = async (n: number): Promise<void> => {
        try {
          const r = await fetch(`${apiBase}/api/public/diamonds?${qs}`, {
            cache: "no-store",
          });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = (await r.json()) as DiamondsResponse;
          if (myReq !== seq.current) return; // superseded by a newer request
          const rows = (data.diamonds || data.data || []) as Diamond[];
          if (resetPage) {
            setDiamonds(rows);
            setPagination(newPage);
          } else {
            setDiamonds((prev) => prev.concat(rows));
          }
          setHasMore(!!data.pagination?.hasMore);
          if (typeof data.totalCount === "number") setTotal(data.totalCount);
          else if (typeof data.count === "number") setTotal(data.count);
          if (myReq === seq.current) setLoading(false);
        } catch (e) {
          if (myReq !== seq.current) return; // a newer request took over
          const status = Number(
            String((e as Error).message).replace(/\D+/g, "")
          );
          // Retry transient upstream failures (5xx) and network errors only —
          // never 4xx (those won't fix themselves on retry).
          const retryable = !Number.isFinite(status) || status >= 500;
          if (retryable && n < MAX_RETRIES) {
            await new Promise((res) => setTimeout(res, (n + 1) * 1200));
            if (myReq !== seq.current) return;
            return attempt(n + 1);
          }
          setError(
            "Our diamond catalogue is taking a moment to load — this usually clears in a few seconds."
          );
          setLoading(false);
        }
      };

      attempt(0);
    },
    [shop, filters, pagination, perPage, apiBase]
  );

  // debounced refetch on filter change
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => refetch(true), 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // first mount — also parse initial filter state from URL search params so
  // deep links from the nav mega-menu (e.g. /diamonds?shape=Round) land
  // pre-filtered. Only reads the params we currently link from; ignores
  // unknown params silently.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URL(window.location.href).searchParams;
      const shape = sp.get("shape");
      const treatment = sp.get("treatment");
      if (shape || treatment) {
        setFilters((f) => ({
          ...f,
          ...(shape ? { shape } : {}),
          ...(treatment === "lab-grown" || treatment === "natural"
            ? { treatment: treatment as FilterState["treatment"] }
            : {}),
        }));
        // setFilters triggers the debounced refetch — no manual call needed
        return;
      }
    }
    refetch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Read ?id= on mount + react to back/forward navigation. The drawer is
  // URL-driven: pushState on open, popstate or replaceState on close. We
  // never reload, so the catalog grid + scroll position are preserved.
  // Ring Studio mode owns its own URL — skip this sync entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const id = new URL(window.location.href).searchParams.get("id");
      setSelectedId(id);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const openDiamond = useCallback((d: Diamond) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("id") === d.id) return;
    url.searchParams.set("id", d.id);
    window.history.pushState({ ds: "open", id: d.id }, "", url.toString());
    pushedHistoryRef.current = true;
    setSelectedId(d.id);
  }, []);

  const closeDrawer = useCallback(() => {
    if (typeof window === "undefined") return;
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("id")) {
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url.toString());
    }
    setSelectedId(null);
  }, []);

  const sorted = useMemo(() => sortDiamonds(diamonds, sort), [diamonds, sort]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextFrom = pagination.to + 1;
    const nextTo = nextFrom + perPage - 1;
    setPagination({ from: nextFrom, to: nextTo });
    const myReq = ++seq.current;
    setLoading(true);
    const qs = buildQuery(shop, filters, {
      from: nextFrom,
      to: nextTo,
      count: false,
    });
    fetch(`${apiBase}/api/public/diamonds?${qs}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<DiamondsResponse>;
      })
      .then((data) => {
        if (myReq !== seq.current) return;
        const rows = (data.diamonds || data.data || []) as Diamond[];
        setDiamonds((prev) => prev.concat(rows));
        setHasMore(!!data.pagination?.hasMore);
      })
      .catch((e: Error) => {
        if (myReq !== seq.current) return;
        setError(e.message || "Failed to load");
      })
      .finally(() => {
        if (myReq === seq.current) setLoading(false);
      });
  };

  const handleAdd = async (d: Diamond) => {
    setBusyAddId(d.id);
    try {
      const sessionId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("estrella_session_id") ||
            (() => {
              const s = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
              window.localStorage.setItem("estrella_session_id", s);
              return s;
            })()
          : "";
      const res = await fetch(`${apiBase}/api/public/cart/add`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shop, sessionId, productId: d.id }),
      });
      if (!res.ok) {
        const msg =
          res.status === 503
            ? "Online cart is temporarily unavailable. Please try again."
            : `Add to cart failed (${res.status})`;
        throw new Error(msg);
      }
      // Surface the cart count to the rest of the page via a custom event.
      window.dispatchEvent(new CustomEvent("estrella-cart-changed"));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyAddId(null);
    }
  };

  const totalLabel = total != null ? total.toLocaleString("en-US") : "…";

  // Inline view-swap (Nivoda pattern): when a diamond is selected, the
  // catalog renders the detail view in place of filters + grid. Hero
  // and page header live in app/diamonds/page.tsx and remain visible.
  if (selectedId) {
    return (
      <div className="ds-catalog">
        <DiamondDetailView
          diamondId={selectedId}
          diamond={diamonds.find((x) => x.id === selectedId) || null}
          onBack={closeDrawer}
          onAddToCart={handleAdd}
          busyAddId={busyAddId}
          mode={mode}
          onSelect={onSelect}
        />
      </div>
    );
  }

  return (
    <div className="ds-catalog">
      <DiamondFilters value={filters} onChange={setFilters} />

      <div className="ds-results-bar">
        <div className="ds-results-bar__left">
          <span className="ds-results-bar__count">
            Results - {totalLabel} Diamonds
          </span>
          <button type="button" className="ds-shipping">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 7 L14 7 L14 16 L3 16 Z M14 10 L18 10 L21 13 L21 16 L14 16 Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="17" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span>Shipping time</span>
          </button>
        </div>
        <div className="ds-results-bar__right">
          <div className="ds-view-toggle" role="group" aria-label="View">
            <button
              type="button"
              className={`ds-view-toggle__btn ${view === "list" ? "ds-view-toggle__btn--active" : ""}`}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              <span>List</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="5" width="18" height="3" stroke="currentColor" strokeWidth="1.4" />
                <rect x="3" y="11" width="18" height="3" stroke="currentColor" strokeWidth="1.4" />
                <rect x="3" y="17" width="18" height="3" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <button
              type="button"
              className={`ds-view-toggle__btn ${view === "grid" ? "ds-view-toggle__btn--active" : ""}`}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
            >
              <span>Grid</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.4" />
                <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.4" />
                <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.4" />
                <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>

          <label className="ds-sort">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="ds-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refetch(true)}
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading && diamonds.length === 0 ? (
        <DiamondGridSkeleton count={perPage} />
      ) : (
        <div
          className={`ds-grid ${view === "list" ? "ds-grid--list" : "ds-grid--grid"}`}
        >
          {sorted.map((d) => (
            <DiamondCard
              key={d.id}
              diamond={d}
              onAddToCart={handleAdd}
              onOpen={openDiamond}
              busy={busyAddId === d.id}
              mode={mode}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && !error ? (
        <div className="ds-empty">
          No diamonds match these filters. Try widening your criteria.
        </div>
      ) : null}

      {hasMore ? (
        <div className="ds-load-more-wrap">
          <button
            type="button"
            className="ds-load-more"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more diamonds"}
          </button>
        </div>
      ) : null}

    </div>
  );
}
