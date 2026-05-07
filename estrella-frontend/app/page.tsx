import { VideoHero } from "@/components/hero/VideoHero";
import { DiamondsOnSale } from "@/components/sale-strip/DiamondsOnSale";
import { CategoryTilesGrid } from "@/components/category-tiles/CategoryTilesGrid";
import { RingStudioBanner } from "@/components/ring-studio/RingStudioBanner";
import { BestSellersRow } from "@/components/best-sellers/BestSellersRow";
import { RingStudioMini } from "@/components/ring-studio/RingStudioMini";
import { ValueStrip } from "@/components/value-strip/ValueStrip";
import { AboutSection } from "@/components/about/AboutSection";
import { ExpressDiamondsBand } from "@/components/express-band/ExpressDiamondsBand";

export default function Home() {
  return (
    <>
      <VideoHero />
      <DiamondsOnSale />
      <CategoryTilesGrid />
      <RingStudioBanner />
      <BestSellersRow />
      <RingStudioMini />
      <ValueStrip />
      <AboutSection />
      <ExpressDiamondsBand />
    </>
  );
}
