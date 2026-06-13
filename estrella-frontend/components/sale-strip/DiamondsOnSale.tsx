import { DiamondVideoTile } from "./DiamondVideoTile";

type Stone = {
  shape: string;
  stockNum: string;
  posterSrc: string;
  alt: string;
};

// Layout matches the Aria Morelle reference: 4 columns × 2 rows.
// Top row: Oval, Asscher, Cushion, Pear   (curved / soft shapes)
// Bottom:  Emerald, Round, Marquise, Heart (mixed character shapes)
// Each tile loads a live 360° rotation via viewmydiamonds.com iframe; the
// rembg poster PNG holds the slot until the iframe is ready.
const STONES: Stone[] = [
  { shape: "Oval", stockNum: "0VOWQ3YWSP", posterSrc: "/diamonds-on-sale-cut/5-oval.png", alt: "Oval-cut diamond" },
  { shape: "Asscher", stockNum: "A9XU1TM11I", posterSrc: "/diamonds-on-sale-cut/2-princess.png", alt: "Asscher-cut diamond" },
  { shape: "Cushion", stockNum: "Y0B33LPUXT", posterSrc: "/diamonds-on-sale-cut/8-cushion.png", alt: "Cushion-cut diamond" },
  { shape: "Pear", stockNum: "ITWZ3KJZY8", posterSrc: "/diamonds-on-sale-cut/7-pear.png", alt: "Pear-cut diamond" },
  { shape: "Emerald", stockNum: "CCLWIZCN9Q", posterSrc: "/diamonds-on-sale-cut/6-emerald.png", alt: "Emerald-cut diamond" },
  { shape: "Round", stockNum: "KOTGTTZC82", posterSrc: "/diamonds-on-sale-cut/3-round.png", alt: "Round brilliant diamond" },
  { shape: "Marquise", stockNum: "V2FRHFFDPF", posterSrc: "/diamonds-on-sale-cut/4-marquise.png", alt: "Marquise-cut diamond" },
  { shape: "Heart", stockNum: "VS19UC37B7", posterSrc: "/diamonds-on-sale-cut/1-heart.png", alt: "Heart-cut diamond" },
];

export function DiamondsOnSale() {
  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, var(--sale-strip-bg-start) 0%, var(--sale-strip-bg-end) 100%)",
        paddingTop: "clamp(28px, 3vw, 48px)",
        paddingBottom: "clamp(64px, 8vw, 120px)",
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
            fontSize: "clamp(22px, 3.4vw, 44px)",
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

        <ul className="sale-strip__grid">
          {STONES.map((stone) => (
            <li
              key={stone.shape}
              style={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <DiamondVideoTile
                shape={stone.shape}
                stockNum={stone.stockNum}
                posterSrc={stone.posterSrc}
                alt={stone.alt}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
