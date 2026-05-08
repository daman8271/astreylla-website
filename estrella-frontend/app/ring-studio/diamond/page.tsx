import "@/components/diamonds/diamonds.css";
import { StageDiamond } from "@/components/ring-studio/StageDiamond";

const SHOP =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "trial-shop-sqxnl71f.myshopify.com";

export default function RingStudioDiamondPage() {
  return <StageDiamond shop={SHOP} />;
}
