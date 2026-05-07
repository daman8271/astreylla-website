import Link from "next/link";
import { formatMoney, type ProductCard as ProductCardType } from "@/lib/shopify";

export function ProductCard({ product }: { product: ProductCardType }) {
  const min = product.priceRange.minVariantPrice;
  const max = product.priceRange.maxVariantPrice;
  const compare = product.compareAtPriceRange?.minVariantPrice;
  const showRange = min.amount !== max.amount;
  const onSale =
    !!compare && parseFloat(compare.amount) > parseFloat(min.amount);

  return (
    <Link
      href={`/products/${product.handle}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {product.featuredImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 600ms cubic-bezier(0.32, 0.72, 0.16, 1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
            }}
          >
            No image
          </div>
        )}
        {onSale && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--brand-text-primary, #1a1208)",
              color: "var(--brand-bg, #fff)",
              padding: "4px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderRadius: 999,
            }}
          >
            Sale
          </span>
        )}
        {!product.availableForSale && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.92)",
              color: "var(--brand-text-primary, #1a1208)",
              padding: "4px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderRadius: 999,
            }}
          >
            Sold out
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            lineHeight: 1.3,
            color: "var(--brand-text-primary)",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {product.title}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--brand-text-primary)",
          }}
        >
          <span>
            {showRange
              ? `${formatMoney(min)} – ${formatMoney(max)}`
              : formatMoney(min)}
          </span>
          {onSale && (
            <span
              style={{
                color: "var(--brand-text-muted)",
                textDecoration: "line-through",
                fontSize: 13,
              }}
            >
              {formatMoney(compare)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
