"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { COUNTRIES, DEFAULT_CODE, STORAGE_KEY } from "@/lib/currency";

function flagUrl(code: string, size: 80 | 160 = 80) {
  return `https://flagcdn.com/w${size}/${code}.png`;
}

export function CountrySelector({ fg }: { fg: string }) {
  const [open, setOpen] = useState(false);
  const { country: selected, setCountryCode } = useCurrency();
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Outside-click close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (code: string) => {
    setCountryCode(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={`Localization — currently ${selected.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="hover:opacity-70 transition-opacity"
        style={{
          background: "transparent",
          border: 0,
          color: fg,
          height: 44,
          padding: "0 4px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 20,
            height: 20,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flagUrl(selected.code)}
            alt=""
            width={20}
            height={20}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </span>
        <span className="currency-country" style={{ fontSize: 12 }}>
          {selected.code.toUpperCase()}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select country"
          className="ds-country-panel"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 360,
            maxHeight: 520,
            background: "var(--brand-bg)",
            color: "var(--brand-text-primary)",
            borderRadius: 12,
            border: "1px solid var(--brand-border-subtle)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 200,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid var(--brand-border-subtle)",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or currency"
              autoFocus
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--brand-border-subtle)",
                borderRadius: 8,
                background: "transparent",
                color: "var(--brand-text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "6px 0",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {filtered.length === 0 ? (
              <li
                style={{
                  padding: "16px 16px",
                  color: "var(--brand-text-muted)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                No matches
              </li>
            ) : (
              filtered.map((c) => {
                const isSelected = c.code === selected.code;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c.code)}
                      className="ds-country-row"
                      style={{
                        width: "100%",
                        background: isSelected
                          ? "var(--surface-soft)"
                          : "transparent",
                        border: 0,
                        padding: "10px 16px",
                        display: "grid",
                        gridTemplateColumns: "28px 1fr auto",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        color: "var(--brand-text-primary)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        textAlign: "left",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#fff",
                          border: "1px solid rgba(0,0,0,0.08)",
                          flexShrink: 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={flagUrl(c.code)}
                          alt=""
                          loading="lazy"
                          width={24}
                          height={24}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </span>
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.02em" }}>
                        {c.name}
                      </span>
                      <span
                        style={{
                          color: "var(--brand-text-secondary)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ({c.currency} {c.symbol})
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
