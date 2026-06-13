import Link from "next/link";

export function ExpressDiamondsBand() {
  return (
    <section className="express-band" aria-labelledby="express-heading">
      <div className="express-band__grid">
        <div className="express-band__media">
          <video
            className="express-band__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/diamond.mp4" type="video/mp4" />
          </video>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            padding: "clamp(48px, 6vw, 96px) 24px",
          }}
        >
          <p className="express-band__eyebrow" style={{ marginInline: "auto" }}>
            Express Delivery
          </p>
          <h2
            id="express-heading"
            className="express-band__title"
            style={{
              marginInline: "auto",
              textAlign: "center",
            }}
          >
            From order to door in <em>five days</em>.
          </h2>
          <p
            className="express-band__sub"
            style={{
              marginInline: "auto",
              textAlign: "center",
            }}
          >
            Quality, speed, and price &mdash; without compromise.
          </p>
          <Link href="/diamonds" className="estrella-btn estrella-btn--pill-ink">
            Shop Express Diamonds
          </Link>
        </div>
      </div>
    </section>
  );
}
