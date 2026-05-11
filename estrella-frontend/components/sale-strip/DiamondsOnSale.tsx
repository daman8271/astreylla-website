import Link from "next/link";
import Image from "next/image";

type Stone = {
  shape: string;
  src: string;
  alt: string;
};

// Layout matches the Aria Morelle reference: 4 columns × 2 rows.
// Top row: Oval, Asscher, Cushion, Pear   (curved / soft shapes)
// Bottom:  Emerald, Round, Marquise, Heart (mixed character shapes)
// (Asscher is filled by our Princess photo — closest square step-cut analogue.)
const STONES: Stone[] = [
  { shape: "Oval", src: "/diamonds-on-sale-cut/5-oval.png", alt: "Oval-cut diamond" },
  { shape: "Asscher", src: "/diamonds-on-sale-cut/2-princess.png", alt: "Asscher-cut diamond" },
  { shape: "Cushion", src: "/diamonds-on-sale-cut/8-cushion.png", alt: "Cushion-cut diamond" },
  { shape: "Pear", src: "/diamonds-on-sale-cut/7-pear.png", alt: "Pear-cut diamond" },
  { shape: "Emerald", src: "/diamonds-on-sale-cut/6-emerald.png", alt: "Emerald-cut diamond" },
  { shape: "Round", src: "/diamonds-on-sale-cut/3-round.png", alt: "Round brilliant diamond" },
  { shape: "Marquise", src: "/diamonds-on-sale-cut/4-marquise.png", alt: "Marquise-cut diamond" },
  { shape: "Heart", src: "/diamonds-on-sale-cut/1-heart.png", alt: "Heart-cut diamond" },
];

export function DiamondsOnSale() {
  return (
    <section
      style={{
        background: "var(--surface-soft)",
        paddingBlock: "clamp(72px, 9vw, 140px)",
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
            fontSize: "clamp(20px, 1.8vw, 26px)",
            lineHeight: 1.2,
            letterSpacing: "0.18em",
            textAlign: "center",
            color: "var(--brand-text-primary)",
            marginBottom: "clamp(64px, 8vw, 110px)",
            textTransform: "uppercase",
          }}
        >
          Diamonds on Sale Now
        </h2>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            rowGap: "clamp(48px, 7vw, 110px)",
            columnGap: "clamp(24px, 4vw, 72px)",
            listStyle: "none",
            padding: 0,
            margin: 0,
            justifyItems: "center",
            maxWidth: 1200,
            marginInline: "auto",
          }}
        >
          {STONES.map((stone) => (
            <li key={stone.shape} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Link
                href={`/diamonds?shape=${encodeURIComponent(stone.shape)}`}
                aria-label={`Browse ${stone.shape.toLowerCase()} diamonds on sale`}
                style={{
                  display: "block",
                  width: "clamp(110px, 14vw, 200px)",
                  aspectRatio: "1 / 1",
                  position: "relative",
                  filter:
                    "drop-shadow(0 22px 28px rgba(255,255,255,0.05)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))",
                  transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
                className="hover:scale-[1.05]"
              >
                <Image
                  src={stone.src}
                  alt={stone.alt}
                  fill
                  sizes="(max-width: 768px) 25vw, 200px"
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
