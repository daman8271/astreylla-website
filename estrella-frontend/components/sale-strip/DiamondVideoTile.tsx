"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  shape: string;
  stockNum: string;
  posterSrc: string;
  alt: string;
};

export function DiamondVideoTile({ shape, posterSrc, alt }: Props) {
  // Static poster only — no video. Previously each tile mounted a
  // viewmydiamonds.com 360° <iframe> over the poster. When a stone has no
  // video, that iframe serves its own "No video found" + spinner page, which
  // still loads (HTTP 200) so onLoad fires, the poster fades out, and the
  // error page bleeds through. We render the clean rembg PNG and nothing else.
  return (
    <Link
      href={`/diamonds?shape=${encodeURIComponent(shape)}`}
      aria-label={`Browse ${shape.toLowerCase()} diamonds on sale`}
      style={{
        display: "block",
        width: "100%",
        maxWidth: 240,
        aspectRatio: "1 / 1",
        position: "relative",
        filter: "var(--sale-strip-stone-shadow)",
        transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className="hover:scale-[1.03]"
    >
      <Image
        src={posterSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 30vw, 240px"
        style={{ objectFit: "contain" }}
        priority={false}
      />
    </Link>
  );
}
