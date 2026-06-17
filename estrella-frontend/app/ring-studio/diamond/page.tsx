import "@/components/diamonds/diamonds.css";
import { redirect } from "next/navigation";
import { StageDiamond } from "@/components/ring-studio/StageDiamond";

const SHOP =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  "trial-shop-sqxnl71f.myshopify.com";

// Step 2 — requires a setting chosen in Step 1.
export default function RingStudioDiamondPage() {
  return <StageDiamond shop={SHOP} />;}
