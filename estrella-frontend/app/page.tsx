import { VideoHero } from "@/components/hero/VideoHero";
import { DiamondsOnSale } from "@/components/sale-strip/DiamondsOnSale";
import { CategoryTilesGrid } from "@/components/category-tiles/CategoryTilesGrid";
import { RingStudioBanner } from "@/components/ring-studio/RingStudioBanner";
import { BestSellersRow } from "@/components/best-sellers/BestSellersRow";
import { RingStudioMini } from "@/components/ring-studio/RingStudioMini";
import { ValueStrip } from "@/components/value-strip/ValueStrip";
import { ExpressDiamondsBand } from "@/components/express-band/ExpressDiamondsBand";

import { ALL_PRODUCTS } from "@/lib/akoirah";
import { mapCrmToSetting } from "@/lib/settings";
import crmData from "@/data/orior-data.json";

export default function Home() {
  const cdnMap = new Map<string, any>();
  for (const p of ALL_PRODUCTS) {
    cdnMap.set(p.bunnyFolder, p);
  }

  // Filter and map only rings that belong to "Trending Now" collection
  const trendingRings = (crmData as any[])
    .filter((crmItem: any) => {
      const isRing = crmItem.CATEGORY?.toLowerCase() === "rings";
      const isTrendingNow = crmItem.COLLECTION?.toLowerCase() === "trending now";
      const folderName = crmItem.ECOM_SKU;
      const cdnProduct = folderName ? cdnMap.get(folderName) : null;
      return isRing && isTrendingNow && cdnProduct && cdnProduct.cdnOk;
    })
    .map((crmItem: any) => {
      const folderName = crmItem.ECOM_SKU;
      const cdnProduct = cdnMap.get(folderName)!;
      const setting = mapCrmToSetting(crmItem, cdnProduct);
      return {
        name: setting.name,
        sku: setting.sku,
        priceFrom: `$${setting.basePriceUsd.toLocaleString()}`,
        image: setting.defaultThumbnail,
      };
    });

  return (
    <>
      <VideoHero />
      <DiamondsOnSale />
      <CategoryTilesGrid />
      <RingStudioBanner />
      <BestSellersRow products={trendingRings} />
      <RingStudioMini />
      <ValueStrip />
      <ExpressDiamondsBand />
    </>
  );
}
