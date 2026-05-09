import Link from "next/link";
import Image from "next/image";

type Stone = {
  shape: string;
  src: string;
  alt: string;
};

const STONES: Stone[] = [
  { shape: "Heart", src: "/diamonds-on-sale/1-heart.jpeg", alt: "Heart-cut diamond" },
  { shape: "Princess", src: "/diamonds-on-sale/2-princess.jpeg", alt: "Princess-cut diamond" },
  { shape: "Round", src: "/diamonds-on-sale/3-round.jpeg", alt: "Round brilliant diamond" },
  { shape: "Marquise", src: "/diamonds-on-sale/4-marquise.jpeg", alt: "Marquise-cut diamond" },
  { shape: "Oval", src: "/diamonds-on-sale/5-oval.jpeg", alt: "Oval-cut diamond" },
  { shape: "Emerald", src: "/diamonds-on-sale/6-emerald.jpeg", alt: "Emerald-cut diamond" },
];

export function DiamondsOnSale() {
  return (
    <section
      style={{
        background: "var(--bg-cream)",
        paddingBlock: "clamp(64px, 8vw, 120px)",
      }}
      aria-labelledby="on-sale-heading"
    >
      <div className="estrella-container">
        <h2
          id="on-sale-heading"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(28px, 3vw, 40px)",
            lineHeight: 1.2,
            letterSpacing: "0.02em",
            textAlign: "center",
            color: "var(--brand-text-primary)",
            marginBottom: "clamp(48px, 6vw, 80px)",
            textTransform: "uppercase",
          }}
        >
          Diamonds on Sale Now
        </h2>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            rowGap: "clamp(48px, 6vw, 80px)",
            columnGap: "clamp(24px, 4vw, 64px)",
            listStyle: "none",
            padding: 0,
            margin: 0,
            justifyItems: "center",
            maxWidth: 1100,
            marginInline: "auto",
          }}
        >
          {STONES.map((stone) => (
            <li key={stone.shape}>
              <Link
                href={`/diamonds?shape=${encodeURIComponent(stone.shape)}`}
                aria-label={`Browse ${stone.shape.toLowerCase()} diamonds on sale`}
                style={{
                  display: "block",
                  width: "clamp(140px, 18vw, 240px)",
                  aspectRatio: "1 / 1",
                  position: "relative",
                  filter: "drop-shadow(0 12px 24px rgba(60,60,60,0.18))",
                  transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
                className="hover:scale-[1.04]"
              >
                <Image
                  src={stone.src}
                  alt={stone.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 240px"
                  style={{ objectFit: "contain" }}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
