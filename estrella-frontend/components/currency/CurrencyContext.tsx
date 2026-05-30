"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Country,
  COUNTRIES,
  DEFAULT_CODE,
  STORAGE_KEY,
  DEFAULT_RATES,
  fetchExchangeRates,
} from "@/lib/currency";

type CurrencyContextType = {
  country: Country;
  currency: string;
  symbol: string;
  rate: number;
  rates: Record<string, number>;
  setCountryCode: (code: string) => void;
  convertPrice: (usdAmount: number) => number;
  formatPrice: (usdAmount: number, maximumFractionDigits?: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<Country>(() => {
    // Default fallback
    return COUNTRIES.find((c) => c.code === DEFAULT_CODE) || COUNTRIES[0];
  });
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);

  // Initialize selected country from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const matched = COUNTRIES.find((c) => c.code === saved);
        if (matched) {
          setCountry(matched);
        }
      }
    } catch {
      // Ignored: blocked localStorage
    }

    // Fetch live exchange rates
    fetchExchangeRates().then((fetchedRates) => {
      setRates(fetchedRates);
    });
  }, []);

  // Handler to change selected country/currency
  const setCountryCode = useCallback((code: string) => {
    const matched = COUNTRIES.find((c) => c.code === code);
    if (!matched) return;

    setCountry(matched);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignored
    }

    // Dispatch a custom event to notify other components/tabs if necessary
    window.dispatchEvent(
      new CustomEvent("estrella:currency-changed", {
        detail: { countryCode: code, currency: matched.currency },
      })
    );
  }, []);

  // Listen to custom events (e.g. from other instances or storage updates)
  useEffect(() => {
    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.countryCode) {
        const matched = COUNTRIES.find((c) => c.code === detail.countryCode);
        if (matched) {
          setCountry(matched);
        }
      }
    };
    window.addEventListener("estrella:currency-changed", handleEvent);
    return () => {
      window.removeEventListener("estrella:currency-changed", handleEvent);
    };
  }, []);

  // Conversion calculations
  const activeRate = rates[country.currency] || DEFAULT_RATES[country.currency] || 1.0;

  const convertPrice = useCallback(
    (usdAmount: number) => {
      return usdAmount * activeRate;
    },
    [activeRate]
  );

  const formatPrice = useCallback(
    (usdAmount: number, maximumFractionDigits: number = 0) => {
      const converted = convertPrice(usdAmount);
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: country.currency,
          maximumFractionDigits,
          minimumFractionDigits: maximumFractionDigits,
        }).format(converted);
      } catch {
        return `${country.symbol}${Math.round(converted).toLocaleString()}`;
      }
    },
    [country.currency, country.symbol, convertPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{
        country,
        currency: country.currency,
        symbol: country.symbol,
        rate: activeRate,
        rates,
        setCountryCode,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
