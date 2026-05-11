"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  shape: string;
  stockNum: string;
  posterSrc: string;
  alt: string;
};

const VIEWER_BASE = "https://www.viewmydiamonds.com";

export function DiamondVideoTile({ shape, stockNum, posterSrc, alt }: Props) {
  // Iframe stays mounted (so it can auto-play 360° rotation) but the rembg
  // poster sits over it until the iframe signals it loaded — keeps the
  // section looking clean if the viewer is slow/blocked, then fades to live.
  const [iframeReady, setIframeReady] = useState(false);

  // Augmont's viewmydiamonds viewer supports id/type/autoplay/width/height
  // query params. Autoplay = continuous rotation, no controls.
  const videoSrc = `${VIEWER_BASE}/?id=${encodeURIComponent(
    stockNum
  )}&type=video&autoplay=true`;

  return (
    <Link
      href={`/diamonds?shape=${encodeURIComponent(shape)}`}
      aria-label={`Browse ${shape.toLowerCase()} diamonds on sale — preview 360° rotation`}
      style={{
        display: "block",
        width: "clamp(140px, 17vw, 240px)",
        aspectRatio: "1 / 1",
        position: "relative",
        filter: "var(--sale-strip-stone-shadow)",
        transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className="hover:scale-[1.03]"
    >
      {/* Iframe layer — auto-rotates the 360° JPEG frame sequence */}
      <iframe
        src={videoSrc}
        title={`${shape} 360° rotation`}
        loading="lazy"
        allow="autoplay"
        onLoad={() => setIframeReady(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          background: "transparent",
          opacity: iframeReady ? 1 : 0,
          transition: "opacity 600ms ease-out",
          pointerEvents: "none",
        }}
      />
      {/* Poster layer — clean rembg PNG, fades out when iframe is ready */}
      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 30vw, 240px"
        style={{
          objectFit: "contain",
          opacity: iframeReady ? 0 : 1,
          transition: "opacity 600ms ease-out",
        }}
        priority={false}
      />
    </Link>
  );
}
