"use client";

import type { CSSProperties } from "react";

export type RingStyleName =
  | "solitaire"
  | "pave"
  | "halo"
  | "hidden-halo"
  | "nature"
  | "trilogy"
  | "vintage";

/**
 * Map setting-style data-model strings (e.g. "Hidden Halo", "Three-Stone")
 * to the matching RingStyleName. Side Stone + Three-Stone both render the
 * trilogy illustration (visually identical — center stone with sides).
 */
export function normalizeRingStyle(s: string | null | undefined): RingStyleName {
  if (!s) return "solitaire";
  const k = s.toLowerCase().trim().replace(/\s+/g, "-");
  if (k === "side-stone" || k === "three-stone") return "trilogy";
  const known: Record<string, RingStyleName> = {
    solitaire: "solitaire",
    pave: "pave",
    halo: "halo",
    "hidden-halo": "hidden-halo",
    nature: "nature",
    trilogy: "trilogy",
    vintage: "vintage",
  };
  return known[k] ?? "solitaire";
}

type Props = {
  name: RingStyleName;
  size?: number;
};

/**
 * Renders a ring-style icon by using the cropped PNG as a CSS mask.
 * The fill color comes from `currentColor`, so the icon inherits the
 * surrounding text color — works for both light and dark mode without
 * needing two asset files.
 */
export function RingStyleMaskIcon({ name, size = 24 }: Props) {
  const url = `/ring-styles/${name}.png`;
  const style: CSSProperties = {
    display: "inline-block",
    width: size,
    height: size,
    backgroundColor: "currentColor",
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    flexShrink: 0,
  };
  return <span aria-hidden style={style} />;
}
