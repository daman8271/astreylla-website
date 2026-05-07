"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeroPosterFallback } from "./HeroPosterFallback";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduced, setReduced] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "80vh",
        minHeight: 480,
        overflow: "hidden",
        background: "#0a0a0a",
      }}
      aria-label="Estrella diamonds — hero"
    >
      <HeroPosterFallback />

      {!reduced && !videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.svg"
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/hero-loop.webm" type="video/webm" />
          <source src="/hero-loop.mp4" type="video/mp4" />
        </video>
      )}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div
        className="estrella-container"
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          paddingBlock: "clamp(40px, 8vw, 96px)",
          color: "#ffffff",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "#ffffff",
            maxWidth: "16ch",
            marginBottom: 20,
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Lab-grown diamonds,
          <br />
          jeweller-direct.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.88)",
            maxWidth: "44ch",
            marginBottom: 32,
          }}
        >
          Browse certified loose diamonds at wholesale prices.
        </p>
        <Link href="/diamonds" className="estrella-btn estrella-btn--primary">
          Browse Collection
        </Link>
      </div>
    </section>
  );
}
