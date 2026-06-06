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
    collection?: string;
  };
}

// Step 1 — the Ring Studio entry point. No prerequisites.
export default async function RingStudioSettingPage({ searchParams }: PageProps) {
  const categoryParam = searchParams?.category;
  const collectionParam = searchParams?.collection;

  const crmData = await fetchOriorCrmData();
  
  // Build a map of CDN products by bunnyFolder / id
  const cdnMap = new Map<string, any>();
  for (const p of ALL_PRODUCTS) {
    cdnMap.set(p.bunnyFolder, p);
  }

  // Filter and map rings that exist on CDN and match category/collection if specified
  const customSettings = crmData
    .filter((crmItem: any) => {
      const isRing = crmItem.CATEGORY?.toLowerCase() === "rings";
      const folderName = crmItem.ECOM_SKU;
      const cdnProduct = folderName ? cdnMap.get(folderName) : null;
      if (!isRing || !cdnProduct || !cdnProduct.cdnOk) {
        return false;
      }

      // Filter by category if specified (e.g. category=engagement, everyday, cocktail, solitaire, wedding, etc.)
      if (categoryParam) {
        const cat = categoryParam.toLowerCase();
        const subCat = (crmItem.SUB_CATEGORY || "").toLowerCase();
        const mainCat = (crmItem.CATEGORY || "").toLowerCase();
        if (!subCat.includes(cat) && !mainCat.includes(cat)) {
          return false;
        }
      }

      // Filter by collection if specified (e.g. collection=trending, newly, timeless)
      if (collectionParam) {
        const col = collectionParam.toLowerCase();
        const itemCol = (crmItem.COLLECTION || "").toLowerCase();
        if (!itemCol.includes(col)) {
          return false;
        }
      }

      return true;
    })
    .map((crmItem: any) => {
      const folderName = crmItem.ECOM_SKU;
      const cdnProduct = cdnMap.get(folderName)!;
      return mapCrmToSetting(crmItem, cdnProduct);
    });

  return <StageSetting customSettings={customSettings} />;
}
