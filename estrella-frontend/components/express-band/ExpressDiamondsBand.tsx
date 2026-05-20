import Link from "next/link";

export function ExpressDiamondsBand() {
  return (
    <section className="express-band" aria-labelledby="express-heading">
      <div className="estrella-container express-band__grid">
        <div className="express-band__media">
          <video
            className="express-band__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/express-diamonds-poster.jpg"
            aria-hidden="true"
          >
            <source src="/express-diamonds.mp4" type="video/mp4" />
          </video>
        </div>

        <div>
          <p className="express-band__eyebrow">Express Delivery</p>
          <h2 id="express-heading" className="express-band__title">
            From order to door in <em>five days</em>.
          </h2>
          <p className="express-band__sub">
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
