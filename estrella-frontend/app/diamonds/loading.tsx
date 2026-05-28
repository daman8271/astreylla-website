import "@/components/diamonds/diamonds.css";
import { DiamondGridSkeleton } from "@/components/diamonds/DiamondCardSkeleton";

// Shown during the route transition into /diamonds. A content-shaped skeleton
// (vs. a blocking full-screen spinner) makes the click feel instant.
export default function Loading() {
  return (
    <section
      style={{
        background: "var(--brand-bg)",
        paddingTop: "calc(72px + clamp(32px, 6vw, 80px))",
        paddingBottom: "clamp(32px, 5vw, 64px)",
      }}
    >
      <div className="estrella-container">
        <DiamondGridSkeleton count={12} />
      </div>
    </section>
  );
}
