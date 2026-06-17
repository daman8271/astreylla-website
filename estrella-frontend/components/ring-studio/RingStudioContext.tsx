"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Diamond } from "@/components/diamonds/types";
import type { Setting, SettingMetal } from "./setting-types";
import type { RegionCode } from "@/lib/ringSizes";

const STORAGE_KEY = "augmont:ring-studio:v1";

export type RingStudioState = {
  diamond: Diamond | null;
  setting: Setting | null;
  metalKey: string | null;
  shape: string | null;
  region: RegionCode | null;
  size: { label: string; value: string } | null;
  flowOrder: "setting-first" | "diamond-first";
};

const EMPTY: RingStudioState = {
  diamond: null,
  setting: null,
  metalKey: null,
  shape: null,
  region: null,
  size: null,
  flowOrder: "setting-first",
};

type Ctx = {
  state: RingStudioState;
  setDiamond: (d: Diamond | null) => void;
  setSetting: (s: Setting | null, metal?: SettingMetal | null, shape?: string | null) => void;
  setMetalKey: (k: string | null) => void;
  setShape: (s: string | null) => void;
  setRegion: (r: RegionCode | null) => void;
  setSize: (s: { label: string; value: string } | null) => void;
  setFlowOrder: (order: "setting-first" | "diamond-first") => void;
  reset: () => void;
};

const RingStudioContext = createContext<Ctx | null>(null);

function readStorage(): RingStudioState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return JSON.parse(raw) as RingStudioState;
  } catch {
    return EMPTY;
  }
}

function writeStorage(s: RingStudioState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function RingStudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RingStudioState>(EMPTY);

  // Hydrate from sessionStorage once on mount.
  useEffect(() => {
    setState(readStorage());
  }, []);

  // Mirror to sessionStorage on every change.
  useEffect(() => {
    writeStorage(state);
  }, [state]);

  const setDiamond = useCallback((d: Diamond | null) => {
    setState((prev) => {
      const nextFlowOrder = d && !prev.setting ? "diamond-first" : prev.flowOrder;
      return {
        ...prev,
        diamond: d,
        flowOrder: d === null && !prev.setting ? "setting-first" : nextFlowOrder,
      };
    });
  }, []);

  const setSetting = useCallback(
    (s: Setting | null, metal?: SettingMetal | null, shape?: string | null) => {
      setState((prev) => {
        if (!s) {
          // Removing the setting invalidates the whole build.
          return { ...EMPTY };
        }
        const nextMetal = metal ?? s.metals[0];
        const nextShape = shape ?? prev.shape ?? prev.diamond?.shape ?? null;
        const unchanged = prev.setting?.sku === s.sku && prev.shape === nextShape;
        const nextFlowOrder = !prev.diamond ? "setting-first" : prev.flowOrder;
        // In diamond-first flow, always keep the diamond — it was selected first
        // and picking a setting is Step 2, not Step 1.
        const keepDiamond =
          prev.flowOrder === "diamond-first"
            ? prev.diamond
            : unchanged
            ? prev.diamond
            : null;
        return {
          ...prev,
          setting: s,
          metalKey: nextMetal ? `${nextMetal.karat}-${nextMetal.color}` : null,
          shape: nextShape,
          diamond: keepDiamond,
          flowOrder: nextFlowOrder,
        };
      });
    },
    []
  );

  const setMetalKey = useCallback((k: string | null) => {
    setState((prev) => ({ ...prev, metalKey: k }));
  }, []);

  const setShape = useCallback((s: string | null) => {
    setState((prev) => ({ ...prev, shape: s }));
  }, []);

  const setRegion = useCallback((r: RegionCode | null) => {
    setState((prev) => ({ ...prev, region: r, size: null }));
  }, []);

  const setSize = useCallback((s: { label: string; value: string } | null) => {
    setState((prev) => ({ ...prev, size: s }));
  }, []);

  const setFlowOrder = useCallback((order: "setting-first" | "diamond-first") => {
    setState((prev) => ({ ...prev, flowOrder: order }));
  }, []);

  const reset = useCallback(() => {
    setState(EMPTY);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ state, setDiamond, setSetting, setMetalKey, setShape, setRegion, setSize, setFlowOrder, reset }),
    [state, setDiamond, setSetting, setMetalKey, setShape, setRegion, setSize, setFlowOrder, reset]
  );

  return <RingStudioContext.Provider value={value}>{children}</RingStudioContext.Provider>;
}

export function useRingStudio(): Ctx {
  const c = useContext(RingStudioContext);
  if (!c) throw new Error("useRingStudio must be used within RingStudioProvider");
  return c;
}

export function getMetalFromKey(setting: Setting | null, key: string | null): SettingMetal | null {
  if (!setting || !key) return null;
  return setting.metals.find((m) => `${m.karat}-${m.color}` === key) ?? null;
}
