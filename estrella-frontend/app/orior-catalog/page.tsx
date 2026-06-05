import React from "react";
import { OriorCatalogExplorer, type UnifiedProduct } from "@/components/orior-catalog/OriorCatalogExplorer";
import rawCatalog from "@/data/akoirah-catalog.json";
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
    console.error("Failed to fetch live Orior CRM data:", error);
  }

  // Fallback to local file if fetch fails
  try {
    const localFilePath = path.join(process.cwd(), "orior-data.json");
    if (fs.existsSync(localFilePath)) {
      console.log("Loading fallback Orior CRM data from local json...");
      const fileContent = fs.readFileSync(localFilePath, "utf8");
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Failed to load local fallback Orior CRM data:", err);
  }

  return [];
}

export default async function OriorCatalogPage() {
  const crmData = await fetchOriorCrmData();
  
  // Cast catalog from raw JSON
  const catalog = rawCatalog as any;
  const cdnBase = catalog.cdnBase || "https://akoirah-live.b-cdn.net";
  const generatedAt = catalog.generatedAt || "N/A";

  // Build a map of CDN products by bunnyFolder / id
  const cdnMap = new Map<string, any>();
  if (catalog && Array.isArray(catalog.products)) {
    for (const p of catalog.products) {
      cdnMap.set(p.bunnyFolder, p);
    }
  }

  // Merge CRM items with CDN products
  const unifiedProducts: UnifiedProduct[] = crmData.map((crmItem: any) => {
    const folderName = crmItem.ECOM_SKU;
    const cdnProduct = cdnMap.get(folderName) || null;
    
    return {
      crm: crmItem,
      cdn: cdnProduct,
      id: folderName || crmItem.SKU
    };
  });

  return (
    <main 
      style={{ 
        minHeight: "100vh", 
        background: "var(--brand-bg, #fbf8f3)",
        paddingTop: "75px" // Offset for fixed SiteHeader
      }}
    >
      <OriorCatalogExplorer 
        products={unifiedProducts}
        cdnBase={cdnBase}
        generatedAt={generatedAt}
      />
    </main>
  );
}
