"use client";

import { useCurrency } from "@/components/currency/CurrencyContext";

type Props = {
  totalUsd: number;
  ctaLabel: string;
  ctaDisabled: boolean;
  ctaIcon?: React.ReactNode;
  onPrimary: () => void;
  onWishlist: () => void;
  busy?: boolean;
  successMessage?: string | null;
};

export function OrderTotal({ totalUsd, ctaLabel, ctaDisabled, ctaIcon, onPrimary, onWishlist, busy, successMessage }: Props) {
  const { formatPrice, currency } = useCurrency();
  return (
    <div className="rs-order">
      <div className="rs-order__total">
        <span>Total</span>
        <strong>{formatPrice(totalUsd)} {currency}</strong>
      </div>
      <button
        type="button"
        className="rs-cta rs-cta--primary rs-cta--block"
        onClick={onPrimary}
        disabled={ctaDisabled || busy}
      >
        {ctaIcon ? <span className="rs-cta__icon" aria-hidden>{ctaIcon}</span> : null}
        {busy ? "Submitting…" : ctaLabel}
      </button>
      <button type="button" className="rs-cta rs-cta--block rs-cta--ghost-line" onClick={onWishlist}>
        Add to wishlist
      </button>
      {successMessage ? (
        <div className="rs-order__success" role="status">{successMessage}</div>
      ) : null}
    </div>
  );
}
