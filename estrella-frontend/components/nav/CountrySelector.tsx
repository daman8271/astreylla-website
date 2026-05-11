"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Country = {
  code: string;        // ISO 3166-1 alpha-2 (lowercase, used for flagcdn)
  name: string;        // Display name (uppercase shown via CSS)
  currency: string;    // ISO 4217 code
  symbol: string;      // Currency symbol/abbrev
};

// Curated list — ~90 main markets matching Aria/Nivoda pattern.
// Sorted alphabetically by name. Flag images served by flagcdn.com (free CDN).
const COUNTRIES: Country[] = [
  { code: "af", name: "Afghanistan",         currency: "AFN", symbol: "؋" },
  { code: "al", name: "Albania",             currency: "EUR", symbol: "€" },
  { code: "dz", name: "Algeria",             currency: "DZD", symbol: "د.ج" },
  { code: "ad", name: "Andorra",             currency: "EUR", symbol: "€" },
  { code: "ao", name: "Angola",              currency: "USD", symbol: "$" },
  { code: "ag", name: "Antigua & Barbuda",   currency: "XCD", symbol: "$" },
  { code: "ar", name: "Argentina",           currency: "USD", symbol: "$" },
  { code: "am", name: "Armenia",             currency: "AMD", symbol: "֏" },
  { code: "aw", name: "Aruba",               currency: "AWG", symbol: "ƒ" },
  { code: "au", name: "Australia",           currency: "AUD", symbol: "$" },
  { code: "at", name: "Austria",             currency: "EUR", symbol: "€" },
  { code: "az", name: "Azerbaijan",          currency: "AZN", symbol: "₼" },
  { code: "bs", name: "Bahamas",             currency: "BSD", symbol: "$" },
  { code: "bh", name: "Bahrain",             currency: "USD", symbol: "$" },
  { code: "bd", name: "Bangladesh",          currency: "BDT", symbol: "৳" },
  { code: "bb", name: "Barbados",            currency: "BBD", symbol: "$" },
  { code: "by", name: "Belarus",             currency: "EUR", symbol: "€" },
  { code: "be", name: "Belgium",             currency: "EUR", symbol: "€" },
  { code: "bz", name: "Belize",              currency: "BZD", symbol: "$" },
  { code: "bj", name: "Benin",               currency: "XOF", symbol: "FR" },
  { code: "bm", name: "Bermuda",             currency: "USD", symbol: "$" },
  { code: "bt", name: "Bhutan",              currency: "USD", symbol: "$" },
  { code: "bo", name: "Bolivia",             currency: "BOB", symbol: "Bs." },
  { code: "ba", name: "Bosnia & Herzegovina",currency: "EUR", symbol: "€" },
  { code: "bw", name: "Botswana",            currency: "BWP", symbol: "P" },
  { code: "br", name: "Brazil",              currency: "USD", symbol: "$" },
  { code: "bn", name: "Brunei",              currency: "BND", symbol: "$" },
  { code: "bg", name: "Bulgaria",            currency: "EUR", symbol: "€" },
  { code: "kh", name: "Cambodia",            currency: "KHR", symbol: "៛" },
  { code: "cm", name: "Cameroon",            currency: "XAF", symbol: "CFA" },
  { code: "ca", name: "Canada",              currency: "CAD", symbol: "$" },
  { code: "cv", name: "Cape Verde",          currency: "CVE", symbol: "$" },
  { code: "ky", name: "Cayman Islands",      currency: "KYD", symbol: "$" },
  { code: "td", name: "Chad",                currency: "XAF", symbol: "CFA" },
  { code: "cl", name: "Chile",               currency: "USD", symbol: "$" },
  { code: "cn", name: "China",               currency: "CNY", symbol: "¥" },
  { code: "co", name: "Colombia",            currency: "USD", symbol: "$" },
  { code: "cr", name: "Costa Rica",          currency: "CRC", symbol: "₡" },
  { code: "hr", name: "Croatia",             currency: "EUR", symbol: "€" },
  { code: "cy", name: "Cyprus",              currency: "EUR", symbol: "€" },
  { code: "cz", name: "Czech Republic",      currency: "CZK", symbol: "Kč" },
  { code: "dk", name: "Denmark",             currency: "DKK", symbol: "kr" },
  { code: "do", name: "Dominican Republic",  currency: "DOP", symbol: "$" },
  { code: "ec", name: "Ecuador",             currency: "USD", symbol: "$" },
  { code: "eg", name: "Egypt",               currency: "EGP", symbol: "£" },
  { code: "ee", name: "Estonia",             currency: "EUR", symbol: "€" },
  { code: "et", name: "Ethiopia",            currency: "ETB", symbol: "Br" },
  { code: "fj", name: "Fiji",                currency: "FJD", symbol: "$" },
  { code: "fi", name: "Finland",             currency: "EUR", symbol: "€" },
  { code: "fr", name: "France",              currency: "EUR", symbol: "€" },
  { code: "ge", name: "Georgia",             currency: "GEL", symbol: "₾" },
  { code: "de", name: "Germany",             currency: "EUR", symbol: "€" },
  { code: "gh", name: "Ghana",               currency: "GHS", symbol: "₵" },
  { code: "gr", name: "Greece",              currency: "EUR", symbol: "€" },
  { code: "gt", name: "Guatemala",           currency: "GTQ", symbol: "Q" },
  { code: "hk", name: "Hong Kong SAR",       currency: "HKD", symbol: "$" },
  { code: "hu", name: "Hungary",             currency: "HUF", symbol: "Ft" },
  { code: "is", name: "Iceland",             currency: "ISK", symbol: "kr" },
  { code: "in", name: "India",               currency: "INR", symbol: "₹" },
  { code: "id", name: "Indonesia",           currency: "IDR", symbol: "Rp" },
  { code: "ie", name: "Ireland",             currency: "EUR", symbol: "€" },
  { code: "il", name: "Israel",              currency: "ILS", symbol: "₪" },
  { code: "it", name: "Italy",               currency: "EUR", symbol: "€" },
  { code: "jm", name: "Jamaica",             currency: "JMD", symbol: "$" },
  { code: "jp", name: "Japan",               currency: "JPY", symbol: "¥" },
  { code: "jo", name: "Jordan",              currency: "JOD", symbol: "د.أ" },
  { code: "kz", name: "Kazakhstan",          currency: "KZT", symbol: "₸" },
  { code: "ke", name: "Kenya",               currency: "KES", symbol: "KSh" },
  { code: "kw", name: "Kuwait",              currency: "USD", symbol: "$" },
  { code: "lv", name: "Latvia",              currency: "EUR", symbol: "€" },
  { code: "lb", name: "Lebanon",             currency: "LBP", symbol: "ل.ل" },
  { code: "lt", name: "Lithuania",           currency: "EUR", symbol: "€" },
  { code: "lu", name: "Luxembourg",          currency: "EUR", symbol: "€" },
  { code: "mo", name: "Macao SAR",           currency: "MOP", symbol: "P" },
  { code: "my", name: "Malaysia",            currency: "MYR", symbol: "RM" },
  { code: "mv", name: "Maldives",            currency: "MVR", symbol: "Rf" },
  { code: "mt", name: "Malta",               currency: "EUR", symbol: "€" },
  { code: "mu", name: "Mauritius",           currency: "MUR", symbol: "₨" },
  { code: "mx", name: "Mexico",              currency: "MXN", symbol: "$" },
  { code: "mc", name: "Monaco",              currency: "EUR", symbol: "€" },
  { code: "ma", name: "Morocco",             currency: "MAD", symbol: "د.م" },
  { code: "mm", name: "Myanmar",             currency: "MMK", symbol: "K" },
  { code: "np", name: "Nepal",               currency: "NPR", symbol: "₨" },
  { code: "nl", name: "Netherlands",         currency: "EUR", symbol: "€" },
  { code: "nz", name: "New Zealand",         currency: "NZD", symbol: "$" },
  { code: "ng", name: "Nigeria",             currency: "NGN", symbol: "₦" },
  { code: "no", name: "Norway",              currency: "NOK", symbol: "kr" },
  { code: "om", name: "Oman",                currency: "OMR", symbol: "ر.ع" },
  { code: "pk", name: "Pakistan",            currency: "PKR", symbol: "₨" },
  { code: "pa", name: "Panama",              currency: "USD", symbol: "$" },
  { code: "py", name: "Paraguay",            currency: "PYG", symbol: "₲" },
  { code: "pe", name: "Peru",                currency: "PEN", symbol: "S/" },
  { code: "ph", name: "Philippines",         currency: "PHP", symbol: "₱" },
  { code: "pl", name: "Poland",              currency: "PLN", symbol: "zł" },
  { code: "pt", name: "Portugal",            currency: "EUR", symbol: "€" },
  { code: "qa", name: "Qatar",               currency: "QAR", symbol: "ر.ق" },
  { code: "ro", name: "Romania",             currency: "RON", symbol: "lei" },
  { code: "rw", name: "Rwanda",              currency: "RWF", symbol: "FRw" },
  { code: "sa", name: "Saudi Arabia",        currency: "SAR", symbol: "ر.س" },
  { code: "rs", name: "Serbia",              currency: "RSD", symbol: "дин" },
  { code: "sg", name: "Singapore",           currency: "SGD", symbol: "$" },
  { code: "sk", name: "Slovakia",            currency: "EUR", symbol: "€" },
  { code: "si", name: "Slovenia",            currency: "EUR", symbol: "€" },
  { code: "za", name: "South Africa",        currency: "ZAR", symbol: "R" },
  { code: "kr", name: "South Korea",         currency: "KRW", symbol: "₩" },
  { code: "es", name: "Spain",               currency: "EUR", symbol: "€" },
  { code: "lk", name: "Sri Lanka",           currency: "LKR", symbol: "₨" },
  { code: "se", name: "Sweden",              currency: "SEK", symbol: "kr" },
  { code: "ch", name: "Switzerland",         currency: "CHF", symbol: "CHF" },
  { code: "tw", name: "Taiwan",              currency: "TWD", symbol: "$" },
  { code: "tz", name: "Tanzania",            currency: "TZS", symbol: "TSh" },
  { code: "th", name: "Thailand",            currency: "THB", symbol: "฿" },
  { code: "tt", name: "Trinidad & Tobago",   currency: "TTD", symbol: "$" },
  { code: "tn", name: "Tunisia",             currency: "TND", symbol: "د.ت" },
  { code: "tr", name: "Turkey",              currency: "TRY", symbol: "₺" },
  { code: "ug", name: "Uganda",              currency: "UGX", symbol: "USh" },
  { code: "ua", name: "Ukraine",             currency: "UAH", symbol: "₴" },
  { code: "ae", name: "United Arab Emirates",currency: "AED", symbol: "د.إ" },
  { code: "gb", name: "United Kingdom",      currency: "GBP", symbol: "£" },
  { code: "us", name: "United States",       currency: "USD", symbol: "$" },
  { code: "uy", name: "Uruguay",             currency: "UYU", symbol: "$" },
  { code: "uz", name: "Uzbekistan",          currency: "UZS", symbol: "сўм" },
  { code: "ve", name: "Venezuela",           currency: "USD", symbol: "$" },
  { code: "vn", name: "Vietnam",             currency: "VND", symbol: "₫" },
  { code: "ye", name: "Yemen",               currency: "YER", symbol: "ر.ي" },
  { code: "zm", name: "Zambia",              currency: "USD", symbol: "$" },
  { code: "zw", name: "Zimbabwe",            currency: "USD", symbol: "$" },
];

const STORAGE_KEY = "estrella:selectedCountryCode";
const DEFAULT_CODE = "us";

function flagUrl(code: string, size: 80 | 160 = 80) {
  return `https://flagcdn.com/w${size}/${code}.png`;
}

export function CountrySelector({ fg }: { fg: string }) {
  const [open, setOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>(DEFAULT_CODE);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && COUNTRIES.some((c) => c.code === saved)) {
        setSelectedCode(saved);
      }
    } catch {
      // localStorage may be blocked — silently fall back to default.
    }
  }, []);

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

  const selected = COUNTRIES.find((c) => c.code === selectedCode) ?? COUNTRIES.find((c) => c.code === DEFAULT_CODE)!;

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
    setSelectedCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
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
                const isSelected = c.code === selectedCode;
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

export type { Country };
