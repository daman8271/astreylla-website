"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import "./mega-menu.css";

export type MegaMenuItem = {
  label: string;
  href: string;
  /** Optional leading icon — shape SVG, color dot, metal chip, etc. */
  icon?: ReactNode;
};

export type MegaMenuGroup = {
  heading?: string;
  items: MegaMenuItem[];
  /** Optional "Browse all …" link rendered after this group's items. */
  more?: { label: string; href: string };
};

export type MegaMenuColumn = {
  heading?: string;
  /** Either a flat list (legacy) or sub-groups (Ring Studio pattern). */
  items?: MegaMenuItem[];
  groups?: MegaMenuGroup[];
  more?: { label: string; href: string };
};

export type MegaMenuPromo = {
  image?: string;
  eyebrow: string;
  cta: { label: string; href: string };
};

export type MegaMenuFooter = {
  heading: string;
  items: { label: string; href: string }[];
  more?: { label: string; href: string };
};

export type MegaMenuConfig = {
  columns: MegaMenuColumn[];
  /** One large promo (single tall card) or two stacked smaller cards. */
  promos?: MegaMenuPromo[];
  /** Full-width row beneath columns — Education / guides strip. */
  footer?: MegaMenuFooter;
};

type Props = {
  config: MegaMenuConfig;
  onClose: () => void;
};

function PromoCard({ promo, onClose }: { promo: MegaMenuPromo; onClose: () => void }) {
  return (
    <Link
      href={promo.cta.href}
      onClick={onClose}
      className="ds-mega__promo"
      aria-label={`${promo.eyebrow} — ${promo.cta.label}`}
      style={
        promo.image
          ? {
              backgroundImage: `url(${promo.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="ds-mega__promo-tint" aria-hidden />
      <div className="ds-mega__promo-body">
        <span className="ds-mega__promo-eyebrow">{promo.eyebrow}</span>
        <span className="ds-mega__promo-cta">{promo.cta.label}</span>
      </div>
    </Link>
  );
}

function ItemList({
  items,
  onClose,
}: {
  items: MegaMenuItem[];
  onClose: () => void;
}) {
  return (
    <ul className="ds-mega__list">
      {items.map((item) => (
        <li key={item.label}>
          <Link href={item.href} className="ds-mega__link" onClick={onClose}>
            {item.icon ? <span className="ds-mega__icon" aria-hidden>{item.icon}</span> : null}
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MegaMenu({ config, onClose }: Props) {
  const promos = config.promos ?? [];
  return (
    <div className="ds-mega" role="menu" onMouseLeave={onClose}>
      <div className="estrella-container ds-mega__inner">
        {config.columns.map((col, ci) => (
          <div className="ds-mega__col" key={col.heading || `col-${ci}`}>
            {col.heading ? (
              <div className="ds-mega__col-h">{col.heading}</div>
            ) : null}
            {col.items ? <ItemList items={col.items} onClose={onClose} /> : null}
            {col.groups
              ? col.groups.map((g, gi) => (
                  <div className="ds-mega__group" key={g.heading || `g-${gi}`}>
                    {g.heading ? (
                      <div className="ds-mega__group-h">{g.heading}</div>
                    ) : null}
                    <ItemList items={g.items} onClose={onClose} />
                    {g.more ? (
                      <Link
                        href={g.more.href}
                        className="ds-mega__more"
                        onClick={onClose}
                      >
                        {g.more.label} <span aria-hidden>→</span>
                      </Link>
                    ) : null}
                  </div>
                ))
              : null}
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
        {promos.length ? (
          <div
            className={`ds-mega__promo-col ${
              promos.length > 1 ? "ds-mega__promo-col--stack" : ""
            }`}
          >
            {promos.map((p, i) => (
              <PromoCard key={i} promo={p} onClose={onClose} />
            ))}
          </div>
        ) : null}
      </div>
      {config.footer ? (
        <div className="estrella-container ds-mega__footer">
          <span className="ds-mega__footer-h">{config.footer.heading}</span>
          <ul className="ds-mega__footer-list">
            {config.footer.items.map((item) => (
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
          {config.footer.more ? (
            <Link
              href={config.footer.more.href}
              className="ds-mega__more ds-mega__footer-more"
              onClick={onClose}
            >
              {config.footer.more.label} <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
