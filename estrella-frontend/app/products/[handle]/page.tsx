import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchProductByHandle } from "@/lib/shopify-server";
import { ProductGallery } from "@/components/products/ProductGallery";
import { AddToCartForm } from "@/components/products/AddToCartForm";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  try {
    const product = await fetchProductByHandle(params.handle);
    if (!product) return { title: "Product not found — Estrella" };
    return {
      title: `${product.title} — Estrella`,
      description: product.description?.slice(0, 160) || undefined,
      openGraph: product.featuredImage?.url
        ? { images: [product.featuredImage.url] }
        : undefined,
    };
  } catch {
    return { title: "Estrella" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await fetchProductByHandle(params.handle);
  if (!product) notFound();

  const images = product.images.edges.map((e) => e.node);
  const gallery = images.length
    ? images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <article
      style={{
        background: "var(--brand-bg, #fbf8f3)",
        paddingTop: "calc(72px + clamp(24px, 4vw, 56px))",
        paddingBottom: "clamp(64px, 8vw, 120px)",
      }}
    >
      <div className="estrella-container">
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--brand-text-muted)",
            marginBottom: 24,
          }}
        >
          <Link href="/" style={{ color: "inherit" }}>
            Home
          </Link>
          <span style={{ margin: "0 8px" }}>·</span>
          <span style={{ color: "var(--brand-text-primary)" }}>{product.title}</span>
        </nav>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
            gap: "clamp(32px, 5vw, 80px)",
            alignItems: "start",
          }}
          className="product-detail-grid"
        >
          <ProductGallery images={gallery} fallbackTitle={product.title} />

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(32px, 4vw, 48px)",
                  lineHeight: 1.1,
                  color: "var(--brand-text-primary)",
                  margin: 0,
                }}
              >
                {product.title}
              </h1>
              {!product.availableForSale && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--brand-text-muted)",
                  }}
                >
                  Currently sold out
                </span>
              )}
            </header>

            <AddToCartForm product={product} />

            {product.descriptionHtml && (
              <section
                style={{
                  paddingTop: 24,
                  borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--brand-text-muted)",
                    marginBottom: 12,
                  }}
                >
                  Details
                </h2>
                <div
                  className="product-description"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--brand-text-secondary)",
                  }}
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .product-description p { margin: 0 0 1em 0; }
        .product-description ul { padding-left: 1.2em; margin: 0 0 1em 0; }
        .product-description li { margin-bottom: 0.4em; }
      `}</style>
    </article>
  );
}
