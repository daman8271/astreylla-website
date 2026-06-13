"use client";

import { useCurrency } from "@/components/currency/CurrencyContext";

type Props = {
  icon: React.ReactNode;
  title: string;
  meta: React.ReactNode;
  priceUsd: number;
  onView?: () => void;
  onRemove?: () => void;
};

export function RingSummaryCard({ icon, title, meta, priceUsd, onView, onRemove }: Props) {
  const { formatPrice, currency } = useCurrency();
  return (
    <div className="rs-summary-card">
      <span className="rs-summary-card__icon" aria-hidden>
        {icon}
      </span>
      <div className="rs-summary-card__body">
        <div className="rs-summary-card__title-row">
          <span className="rs-summary-card__title">{title}</span>
          <span className="rs-summary-card__price">{formatPrice(priceUsd)}</span>
        </div>
        <div className="rs-summary-card__meta">{meta}</div>
        <div className="rs-summary-card__actions">
          {onView ? (
            <button type="button" className="rs-summary-card__action" onClick={onView}>View</button>
          ) : null}
          {onRemove ? (
            <button type="button" className="rs-summary-card__action" onClick={onRemove}>Remove</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
