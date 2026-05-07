"use client";

import Link from "next/link";
import "./mega-menu.css";

export type MegaMenuColumn = {
  heading: string;
  items: { label: string; href: string }[];
  /** Optional "Browse all …" link rendered at the bottom of the column. */
  more?: { label: string; href: string };
};

export type MegaMenuPromo = {
  /** Image URL — leave undefined to fall back to a soft cream placeholder. */
  image?: string;
  eyebrow: string;
  cta: { label: string; href: string };
};

export type MegaMenuConfig = {
  columns: MegaMenuColumn[];
  promo?: MegaMenuPromo;
};

type Props = {
  config: MegaMenuConfig;
  onClose: () => void;
};

export function MegaMenu({ config, onClose }: Props) {
  return (
    <div
      className="ds-mega"
      role="menu"
      onMouseLeave={onClose}
    >
      <div className="estrella-container ds-mega__inner">
        {config.columns.map((col) => (
          <div className="ds-mega__col" key={col.heading}>
            <div className="ds-mega__col-h">{col.heading}</div>
            <ul className="ds-mega__list">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="ds-mega__link"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {col.more ? (
              <Link
                href={col.more.href}
                className="ds-mega__more"
                onClick={onClose}
              >
                {col.more.label} <span aria-hidden>→</span>
              </Link>
            ) : null}
          </div>
        ))}
        {config.promo ? (
          <Link
            href={config.promo.cta.href}
            onClick={onClose}
            className="ds-mega__promo"
            aria-label={`${config.promo.eyebrow} — ${config.promo.cta.label}`}
            style={
              config.promo.image
                ? {
                    backgroundImage: `url(${config.promo.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="ds-mega__promo-tint" aria-hidden />
            <div className="ds-mega__promo-body">
              <span className="ds-mega__promo-eyebrow">{config.promo.eyebrow}</span>
              <span className="ds-mega__promo-cta">{config.promo.cta.label}</span>
            </div>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
