"use client";

import type { CSSProperties } from "react";

export type ShapeName =
  | "round"
  | "princess"
  | "oval"
  | "radiant"
  | "pear"
  | "heart"
  | "marquise"
  | "emerald"
  | "cushion"
  | "asscher"
  | "trillion"
  | "trapezoid"
  | "kite"
  | "baguette";

type Props = {
  name: ShapeName;
  size?: number;
};

/**
 * Renders a diamond-shape icon by using the cropped PNG as a CSS mask.
 * The actual fill color comes from `currentColor`, so the icon inherits
 * the surrounding text color — works for both light and dark mode without
 * needing two asset files.
 */
export function ShapeMaskIcon({ name, size = 22 }: Props) {
  const url = `/shapes/${name}.png`;
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
