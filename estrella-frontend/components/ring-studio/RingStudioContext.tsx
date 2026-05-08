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
};

const EMPTY: RingStudioState = {
  diamond: null,
  setting: null,
  metalKey: null,
  shape: null,
  region: null,
  size: null,
};

type Ctx = {
  state: RingStudioState;
  setDiamond: (d: Diamond | null) => void;
  setSetting: (s: Setting | null, metal?: SettingMetal | null, shape?: string | null) => void;
  setMetalKey: (k: string | null) => void;
  setShape: (s: string | null) => void;
  setRegion: (r: RegionCode | null) => void;
  setSize: (s: { label: string; value: string } | null) => void;
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
      if (!d) {
        return { ...EMPTY };
      }
      // Changing diamond invalidates downstream selections (setting may not
      // support the new shape; metal pricing tied to the chosen setting).
      const sameId =
        prev.diamond && (prev.diamond.id === d.id || prev.diamond.stockNum === d.stockNum);
      if (sameId) return { ...prev, diamond: d };
      return { ...EMPTY, diamond: d };
    });
  }, []);

  const setSetting = useCallback(
    (s: Setting | null, metal?: SettingMetal | null, shape?: string | null) => {
      setState((prev) => {
        if (!s) {
          return { ...prev, setting: null, metalKey: null };
        }
        const nextMetal = metal ?? s.metals[0];
        return {
          ...prev,
          setting: s,
          metalKey: nextMetal ? `${nextMetal.karat}-${nextMetal.color}` : null,
          shape: shape ?? prev.shape ?? prev.diamond?.shape ?? null,
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
    () => ({ state, setDiamond, setSetting, setMetalKey, setShape, setRegion, setSize, reset }),
    [state, setDiamond, setSetting, setMetalKey, setShape, setRegion, setSize, reset]
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
