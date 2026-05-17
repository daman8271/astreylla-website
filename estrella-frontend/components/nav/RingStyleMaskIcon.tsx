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
