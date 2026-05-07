"use client";

import { useState } from "react";

type Img = { url: string; altText: string | null };

export function ProductGallery({
  images,
  fallbackTitle,
}: {
  images: Img[];
  fallbackTitle: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--brand-text-muted)",
        }}
      >
        No image
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active].url}
          alt={images[active].altText ?? fallbackTitle}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {images.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(images.length, 6)}, 1fr)`,
            gap: 8,
          }}
        >
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              style={{
                aspectRatio: "1 / 1",
                border:
                  i === active
                    ? "2px solid var(--brand-text-primary, #1a1208)"
                    : "1px solid var(--brand-border, rgba(0,0,0,0.1))",
                borderRadius: 4,
                overflow: "hidden",
                background: "rgba(0,0,0,0.04)",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? `${fallbackTitle} image ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
