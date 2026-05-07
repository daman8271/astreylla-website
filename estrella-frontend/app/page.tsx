import { VideoHero } from "@/components/hero/VideoHero";
import { ShapeTilesGrid } from "@/components/shape-tiles/ShapeTilesGrid";
import { ValueStrip } from "@/components/value-strip/ValueStrip";
import { AboutSection } from "@/components/about/AboutSection";
import { TestimonialsRow } from "@/components/testimonials/TestimonialsRow";

export default function Home() {
  return (
    <>
      <VideoHero />
      <ShapeTilesGrid />
      <ValueStrip />
      <AboutSection />
      <TestimonialsRow />
    </>
  );
}
