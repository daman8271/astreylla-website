import "@/components/diamonds/diamonds.css";
import { StageSetting } from "@/components/ring-studio/StageSetting";
import { ALL_PRODUCTS } from "@/lib/akoirah";
import { mapCrmToSetting } from "@/lib/settings";
import fs from "fs";
import path from "path";

export const revalidate = 600; // Cache for 10 minutes

async function fetchOriorCrmData() {
  const url = "https://akoirah.orior.in/misc_api.aspx";
  const payload = {
    username: "akoirah_api",
    password: "Akoirah@RSBL@987",
    procedure: "STOCK_MTO"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      next: { revalidate: 600 } // Next.js cache
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
  } catch (error) {
    console.error("Failed to fetch live Orior CRM data in setting catalog:", error);
  }

  // Fallback to local file if fetch fails
  try {
    const localFilePath = path.join(process.cwd(), "orior-data.json");
    if (fs.existsSync(localFilePath)) {
      console.log("Loading fallback Orior CRM data from local json in setting catalog...");
      const fileContent = fs.readFileSync(localFilePath, "utf8");
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Failed to load local fallback Orior CRM data:", err);
  }

  return [];
}

interface PageProps {
  searchParams: {
    category?: string;
  };
}

// Step 1 — the Ring Studio entry point. No prerequisites.
export default async function RingStudioSettingPage({ searchParams }: PageProps) {
  const isEngagement = searchParams?.category?.toLowerCase() === "engagement";
  let customSettings = undefined;

  if (isEngagement) {
    const crmData = await fetchOriorCrmData();
    
    // Build a map of CDN products by bunnyFolder / id
    const cdnMap = new Map<string, any>();
    for (const p of ALL_PRODUCTS) {
      cdnMap.set(p.bunnyFolder, p);
    }

    // Filter and map only rings that are in subcategory engagement rings and exist on CDN
    customSettings = crmData
      .filter((crmItem: any) => {
        const isRing = crmItem.CATEGORY?.toLowerCase() === "rings";
        const isEngagementRing = crmItem.SUB_CATEGORY?.toLowerCase().includes("engagement");
        const folderName = crmItem.ECOM_SKU;
        const cdnProduct = folderName ? cdnMap.get(folderName) : null;
        return isRing && isEngagementRing && cdnProduct && cdnProduct.cdnOk;
      })
      .map((crmItem: any) => {
        const folderName = crmItem.ECOM_SKU;
        const cdnProduct = cdnMap.get(folderName)!;
        return mapCrmToSetting(crmItem, cdnProduct);
      });
  }

  return <StageSetting customSettings={customSettings} />;
}
