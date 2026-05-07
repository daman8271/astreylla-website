import { fetchProducts } from "@/lib/shopify-server";
import { ProductCard } from "@/components/products/ProductCard";

export const metadata = {
  title: "All Products — Estrella",
  description:
    "The full Estrella collection — lab-grown diamonds, certified jewellery, and curated gemstones, all jeweller-direct.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string; sort?: string };
}) {
  const sort = searchParams?.sort;
  const sortKey =
    sort === "price-asc" || sort === "price-desc"
      ? ("PRICE" as const)
      : sort === "newest"
        ? ("CREATED_AT" as const)
        : ("BEST_SELLING" as const);
  const reverse = sort === "price-desc" || sort === "newest";

  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let loadError: string | null = null;
  try {
    products = await fetchProducts({
      first: 48,
      sortKey,
      reverse,
      query: searchParams?.q,
    });
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <>
      <section
        style={{
          background: "var(--brand-bg-warm, #f5efe6)",
          paddingTop: "calc(72px + clamp(32px, 6vw, 80px))",
          paddingBottom: "clamp(32px, 5vw, 64px)",
        }}
      >
        <div className="estrella-container" style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              marginBottom: 12,
            }}
          >
            The full collection
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.05,
              color: "var(--brand-text-primary)",
              marginBottom: 16,
            }}
          >
            All Products
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--brand-text-secondary)",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            {products.length} {products.length === 1 ? "piece" : "pieces"} from
            our jeweller-direct collection.
          </p>
        </div>
      </section>

      <section
        style={{
          paddingTop: "clamp(32px, 4vw, 56px)",
          paddingBottom: "clamp(64px, 8vw, 120px)",
          background: "var(--brand-bg, #fbf8f3)",
        }}
      >
        <div className="estrella-container">
          <SortBar current={sort ?? ""} />

          {loadError ? (
            <div
              role="alert"
              style={{
                marginTop: 32,
                padding: 24,
                border: "1px solid var(--brand-border, rgba(0,0,0,0.1))",
                borderRadius: 8,
                background: "rgba(255, 240, 230, 0.5)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--brand-text-secondary)",
              }}
            >
              <strong>Could not load products.</strong>
              <p style={{ marginTop: 8, fontSize: 13 }}>
                Check that <code>NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN</code> is
                set in <code>.env.local</code>. Detail: {loadError}
              </p>
            </div>
          ) : products.length === 0 ? (
            <p
              style={{
                marginTop: 48,
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                color: "var(--brand-text-muted)",
              }}
            >
              No products found.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "clamp(20px, 2.5vw, 32px) clamp(16px, 2vw, 24px)",
                marginTop: 24,
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SortBar({ current }: { current: string }) {
  const opts = [
    { value: "", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price · Low to high" },
    { value: "price-desc", label: "Price · High to low" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--brand-text-muted)",
          alignSelf: "center",
          marginRight: 8,
        }}
      >
        Sort
      </span>
      {opts.map((o) => {
        const active = current === o.value;
        const href = o.value ? `/products?sort=${o.value}` : "/products";
        return (
          <a
            key={o.value}
            href={href}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.06em",
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid var(--brand-border, rgba(0,0,0,0.12))",
              background: active
                ? "var(--brand-text-primary, #1a1208)"
                : "transparent",
              color: active
                ? "var(--brand-bg, #fff)"
                : "var(--brand-text-secondary)",
              textDecoration: "none",
            }}
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
