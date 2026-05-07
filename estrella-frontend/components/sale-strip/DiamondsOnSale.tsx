import Link from "next/link";

type Shape =
  | "oval"
  | "asscher"
  | "cushion"
  | "pear"
  | "emerald"
  | "round"
  | "marquise"
  | "heart";

const STONES: Shape[] = [
  "oval",
  "asscher",
  "cushion",
  "pear",
  "emerald",
  "round",
  "marquise",
  "heart",
];

function StoneSvg({ shape, gradId }: { shape: Shape; gradId: string }) {
  const fill = `url(#${gradId})`;
  const dark = "#3d3d3d";
  const facet = { stroke: dark, strokeWidth: 0.7, fill: "none", opacity: 0.55 };

  const Defs = (
    <defs>
      <linearGradient id={gradId} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#f6f6f6" />
        <stop offset="35%" stopColor="#d8d8d8" />
        <stop offset="65%" stopColor="#bdbdbd" />
        <stop offset="100%" stopColor="#9a9a9a" />
      </linearGradient>
    </defs>
  );

  switch (shape) {
    case "oval":
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true">
          {Defs}
          <ellipse cx="50" cy="65" rx="32" ry="50" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M50 15 L50 115 M18 65 L82 65 M28 30 L72 100 M72 30 L28 100 M50 15 L25 65 L50 115 L75 65 Z" {...facet} />
        </svg>
      );
    case "asscher":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {Defs}
          <path d="M22 12 L78 12 L88 22 L88 78 L78 88 L22 88 L12 78 L12 22 Z" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M28 28 L72 28 L72 72 L28 72 Z M38 38 L62 38 L62 62 L38 62 Z M12 22 L88 78 M88 22 L12 78 M22 12 L78 88 M78 12 L22 88" {...facet} />
        </svg>
      );
    case "cushion":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {Defs}
          <rect x="14" y="14" width="72" height="72" rx="20" ry="20" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M28 28 L72 28 L72 72 L28 72 Z M14 14 L86 86 M86 14 L14 86 M50 14 L50 86 M14 50 L86 50" {...facet} />
        </svg>
      );
    case "pear":
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true">
          {Defs}
          <path d="M50 12 C28 32 18 60 24 88 C28 110 40 122 50 122 C60 122 72 110 76 88 C82 60 72 32 50 12 Z" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M50 12 L50 122 M28 70 L72 70 M36 35 L64 35 M30 95 L70 95" {...facet} />
        </svg>
      );
    case "emerald":
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true">
          {Defs}
          <path d="M28 14 L72 14 L86 28 L86 102 L72 116 L28 116 L14 102 L14 28 Z" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M28 28 L72 28 L72 102 L28 102 Z M38 38 L62 38 L62 92 L38 92 Z M14 28 L86 102 M86 28 L14 102 M50 14 L50 116 M14 65 L86 65" {...facet} />
        </svg>
      );
    case "round":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {Defs}
          <circle cx="50" cy="50" r="42" fill={fill} stroke={dark} strokeWidth="0.8" />
          <circle cx="50" cy="50" r="28" fill="none" stroke={dark} strokeWidth="0.5" opacity="0.5" />
          <path d="M8 50 L92 50 M50 8 L50 92 M21 21 L79 79 M79 21 L21 79 M50 8 L78 50 L50 92 L22 50 Z" {...facet} />
        </svg>
      );
    case "marquise":
      return (
        <svg viewBox="0 0 100 130" aria-hidden="true">
          {Defs}
          <path d="M50 8 C70 30 80 65 80 65 C80 65 70 100 50 122 C30 100 20 65 20 65 C20 65 30 30 50 8 Z" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M20 65 L80 65 M50 8 L50 122 M30 30 L70 100 M70 30 L30 100" {...facet} />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {Defs}
          <path d="M50 86 C24 64 12 46 12 30 C12 18 22 12 30 12 C40 12 47 18 50 28 C53 18 60 12 70 12 C78 12 88 18 88 30 C88 46 76 64 50 86 Z" fill={fill} stroke={dark} strokeWidth="0.8" />
          <path d="M50 28 L50 80 M22 36 L78 36 M50 28 L24 56 M50 28 L76 56 M30 12 L50 86 M70 12 L50 86" {...facet} />
        </svg>
      );
  }
}

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
            color: "#292929",
            marginBottom: "clamp(48px, 6vw, 80px)",
            textTransform: "uppercase",
          }}
        >
          Diamonds on Sale Now
        </h2>

        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
          {STONES.map((shape, i) => (
            <li key={`${shape}-${i}`}>
              <Link
                href={`/diamonds?d_shape=${encodeURIComponent(
                  shape.charAt(0).toUpperCase() + shape.slice(1)
                )}`}
                aria-label={`Browse ${shape} diamonds on sale`}
                style={{
                  display: "block",
                  width: "clamp(96px, 14vw, 180px)",
                  filter: "drop-shadow(0 12px 24px rgba(60,60,60,0.18))",
                  transition: "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
                className="hover:scale-[1.04]"
              >
                <StoneSvg shape={shape} gradId={`stone-grad-${shape}-${i}`} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
