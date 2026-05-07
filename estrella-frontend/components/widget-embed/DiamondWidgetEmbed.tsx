"use client";

import { useEffect, useRef } from "react";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap";

export function DiamondWidgetEmbed() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = FONT_HREF;
    fontLink.dataset.estrellaWidget = "font";
    document.head.appendChild(fontLink);

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "/widget/diamond-widget.css";
    cssLink.dataset.estrellaWidget = "css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "/widget/diamond-widget.js";
    script.defer = true;
    script.dataset.estrellaWidget = "js";
    document.body.appendChild(script);

    return () => {
      document
        .querySelectorAll('[data-estrella-widget]')
        .forEach((el) => el.parentNode?.removeChild(el));
    };
  }, []);

  return (
    <div
      id="diamond-widget-root"
      className="diamond-widget"
      data-shop="trial-shop-sqxnl71f.myshopify.com"
      data-api-url="/api/widget"
      data-per-page="12"
      data-show-filters="true"
      data-primary-color="#c9a961"
    />
  );
}
