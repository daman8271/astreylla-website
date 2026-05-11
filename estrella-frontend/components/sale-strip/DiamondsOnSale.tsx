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
        background:
          "linear-gradient(180deg, #f3ede2 0%, #ece4d5 100%)",
        paddingBlock: "clamp(64px, 8vw, 120px)",
      }}
      aria-labelledby="on-sale-heading"
    >
      <div className="estrella-container">
        <h2
          id="on-sale-heading"
          style={{
            fontFamily:
              "var(--font-cormorant), Cormorant, 'Cormorant Garamond', Garamond, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(30px, 3.4vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "0.06em",
            textAlign: "center",
            color: "var(--brand-text-primary)",
            marginBottom: "clamp(48px, 6vw, 84px)",
            textTransform: "uppercase",
          }}
        >
          Diamonds on Sale Now
        </h2>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            rowGap: "clamp(32px, 4vw, 64px)",
            columnGap: "clamp(20px, 3vw, 56px)",
            listStyle: "none",
            padding: 0,
            margin: 0,
            justifyItems: "center",
            maxWidth: 1200,
            marginInline: "auto",
          }}
        >
          {STONES.map((stone) => (
            <li
              key={stone.shape}
              style={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <Link
                href={`/diamonds?shape=${encodeURIComponent(stone.shape)}`}
                aria-label={`Browse ${stone.shape.toLowerCase()} diamonds on sale`}
                style={{
                  display: "block",
                  width: "clamp(140px, 17vw, 240px)",
                  aspectRatio: "1 / 1",
                  position: "relative",
                  filter:
                    "drop-shadow(0 18px 28px rgba(60,40,20,0.10)) drop-shadow(0 6px 12px rgba(60,40,20,0.08))",
                  transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
                className="hover:scale-[1.03]"
              >
                <Image
                  src={stone.src}
                  alt={stone.alt}
                  fill
                  sizes="(max-width: 768px) 30vw, 240px"
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
