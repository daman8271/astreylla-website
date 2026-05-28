// Content-shaped placeholders shown while the catalog loads. Matching the real
// card layout makes navigation feel instant instead of flashing a full-screen
// spinner. Pure presentational markup — safe to render from server components.

export function DiamondCardSkeleton() {
  return (
    <div className="ds-card ds-card--skeleton" aria-hidden>
      <div className="ds-card__media" />
      <div className="ds-card__body">
        <div className="ds-card__skeleton-line" style={{ width: "65%" }} />
        <div className="ds-card__skeleton-specs">
          <span className="ds-card__skeleton-chip" />
          <span className="ds-card__skeleton-chip" />
          <span className="ds-card__skeleton-chip" />
        </div>
        <div className="ds-card__skeleton-line ds-card__skeleton-line--price" />
        <div className="ds-card__skeleton-cta" />
      </div>
    </div>
  );
}

export function DiamondGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="ds-grid ds-grid--grid"
      role="status"
      aria-busy="true"
      aria-label="Loading diamonds"
    >
      {Array.from({ length: count }).map((_, i) => (
        <DiamondCardSkeleton key={i} />
      ))}
    </div>
  );
}
