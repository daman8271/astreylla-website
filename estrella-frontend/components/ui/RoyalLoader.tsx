import "./royal-loader.css";

type Props = {
  /** Full-screen overlay (route loading) vs. inline block (in-page sections). */
  variant?: "overlay" | "inline";
  label?: string;
};

/**
 * Royal-look loading indicator: the Astreylla monogram inside a rotating gold
 * ring with a shimmering wordmark. Presentational only — wired site-wide via
 * Next.js `loading.tsx` segments and used inline by data-fetching sections.
 * The logo is theme-aware via CSS (no JS), so it works in server components.
 */
export function RoyalLoader({ variant = "overlay", label = "Loading" }: Props) {
  return (
    <div
      className={`royal-loader royal-loader--${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="royal-loader__emblem">
        <span className="royal-loader__ring" aria-hidden />
        <span className="royal-loader__ring royal-loader__ring--inner" aria-hidden />
        <span className="royal-loader__mark" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="royal-loader__logo royal-loader__logo--light"
            src="/logo/logo-light.png"
            alt=""
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="royal-loader__logo royal-loader__logo--dark"
            src="/logo/logo-dark.png"
            alt=""
          />
        </span>
      </div>
      <span className="royal-loader__wordmark" aria-hidden>
        ASTREYLLA
      </span>
      <span className="royal-loader__sr">{label}…</span>
    </div>
  );
}
