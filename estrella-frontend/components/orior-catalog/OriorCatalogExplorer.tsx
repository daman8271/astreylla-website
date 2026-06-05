"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Sparkles, 
  Play, 
  Copy, 
  ExternalLink, 
  X, 
  Info, 
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Gem,
  Coins,
  Layers,
  Sparkle
} from "lucide-react";

export type OriorCrmItem = {
  SKU: string;
  ECOM_SKU: string;
  APPROX_GROSS_WT: number;
  APPROX_NET_WT: number;
  APPROX_DIA_PCS: number;
  APPROX_DIA_WT: number;
  APPROX_DIA_QLTY: string;
  DIA_CLARITY: string;
  DIA_COLOR: string;
  APPROX_POLKI_PCS: number;
  APPROX_POLKI_WT: number;
  APPROX_MRP_LIST: Array<{ KT: string; MRP: number }>;
  UNIT: string;
  CATEGORY: string;
  SUB_CATEGORY: string;
  COLLECTION: string;
  TITLE: string;
  POST_CONTENT: string;
  DESCRIPTION: string;
  KEYWORDS: string;
  KEYWORDS2: string;
  GENDER: string;
  SHAPE: string;
  OCCASSION: string;
  NO_OF_PCS: number;
  GST_RATE: number;
};

export type BunnyCdnProduct = {
  id: string;
  category: string;
  categoryCode: string;
  akoId: string | null;
  cdiRef: string | null;
  bunnyFolder: string;
  assetBase: string;
  cdnOk: boolean;
  cdnCode: number | null;
  metalCodes: string[];
  metals: Record<string, {
    main: string | null;
    video: string | null;
    stills: string[];
    card: string | null;
    gallery: string[];
  }>;
};

export type UnifiedProduct = {
  crm: OriorCrmItem;
  cdn: BunnyCdnProduct | null;
  id: string; // matches ECOM_SKU or cdn.id
};

interface OriorCatalogExplorerProps {
  products: UnifiedProduct[];
  cdnBase: string;
  generatedAt: string;
}

export function OriorCatalogExplorer({ products, cdnBase, generatedAt }: OriorCatalogExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShape, setSelectedShape] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [metalColorFilter, setMetalColorFilter] = useState<"ALL" | "RG" | "WG" | "YG">("ALL");
  const [cdnStatusFilter, setCdnStatusFilter] = useState<"ALL" | "OK" | "MISSING">("ALL");
  
  // Selected product state for details modal
  const [activeProduct, setActiveProduct] = useState<UnifiedProduct | null>(null);
  const [activeMetalColor, setActiveMetalColor] = useState<"RG" | "WG" | "YG">("WG");
  const [activeKarat, setActiveKarat] = useState<string>("18KT");
  const [activeMediaTab, setActiveMediaTab] = useState<"stills" | "video">("stills");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Individual product metal color state overrides for grid preview
  const [gridMetalColors, setGridMetalColors] = useState<Record<string, "RG" | "WG" | "YG">>({});
  const [gridKarats, setGridKarats] = useState<Record<string, string>>({});

  // Dynamic filter options based on data
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.crm.CATEGORY));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const shapes = useMemo(() => {
    const set = new Set(products.map(p => p.crm.SHAPE).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const collections = useMemo(() => {
    const set = new Set(products.map(p => p.crm.COLLECTION).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  // Handle SKU copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Filter products based on state
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search term match
      const searchLower = search.toLowerCase();
      const matchSearch = 
        p.crm.SKU.toLowerCase().includes(searchLower) ||
        p.crm.ECOM_SKU.toLowerCase().includes(searchLower) ||
        p.crm.TITLE.toLowerCase().includes(searchLower) ||
        (p.crm.DESCRIPTION && p.crm.DESCRIPTION.toLowerCase().includes(searchLower)) ||
        (p.crm.KEYWORDS && p.crm.KEYWORDS.toLowerCase().includes(searchLower));

      const matchCategory = selectedCategory === "All" || p.crm.CATEGORY === selectedCategory;
      const matchShape = selectedShape === "All" || p.crm.SHAPE === selectedShape;
      const matchCollection = selectedCollection === "All" || p.crm.COLLECTION === selectedCollection;
      
      const hasCdn = !!p.cdn;
      const matchCdn = cdnStatusFilter === "ALL" || 
        (cdnStatusFilter === "OK" && hasCdn && p.cdn?.cdnOk) ||
        (cdnStatusFilter === "MISSING" && (!hasCdn || !p.cdn?.cdnOk));

      // Check if product supports selected metal color in CDN
      let matchMetal = true;
      if (metalColorFilter !== "ALL") {
        if (p.cdn) {
          matchMetal = p.cdn.metalCodes.includes(metalColorFilter);
        } else {
          matchMetal = false;
        }
      }

      return matchSearch && matchCategory && matchShape && matchCollection && matchCdn && matchMetal;
    });
  }, [products, search, selectedCategory, selectedShape, selectedCollection, cdnStatusFilter, metalColorFilter]);

  // Get absolute URL helper
  const getAssetUrl = (assetBase: string, filename: string) => {
    const base = assetBase.split("/").map(encodeURIComponent).join("/");
    return `${cdnBase}/${base}/${encodeURIComponent(filename)}`;
  };

  // Resolve grid card display image
  const getGridProductImage = (prod: UnifiedProduct) => {
    const id = prod.id;
    const color = gridMetalColors[id] || (prod.cdn?.metalCodes[0] as "RG" | "WG" | "YG") || "WG";
    
    if (prod.cdn && prod.cdn.metals[color]) {
      const metalBlock = prod.cdn.metals[color];
      const filename = metalBlock.card || metalBlock.main || metalBlock.gallery[0];
      if (filename) {
        return getAssetUrl(prod.cdn.assetBase, filename);
      }
    }
    
    return `https://placehold.co/400x400/dadada/333333?text=${encodeURIComponent(prod.crm.TITLE)}`;
  };

  const openModal = (prod: UnifiedProduct) => {
    setActiveProduct(prod);
    const initialColor = (prod.cdn?.metalCodes[0] as "RG" | "WG" | "YG") || "WG";
    setActiveMetalColor(initialColor);
    
    // Default to the first available price karat
    const initialKarat = prod.crm.APPROX_MRP_LIST[0]?.KT || "18KT";
    setActiveKarat(initialKarat);
    
    // Default media tab based on what's available
    const hasVideo = prod.cdn && prod.cdn.metals[initialColor]?.video;
    setActiveMediaTab(hasVideo ? "video" : "stills");
  };

  const getFormatPrice = (mrp: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(mrp);
  };

  return (
    <div className="orior-explorer-container" style={{ color: "var(--brand-text-primary)" }}>
      {/* Hero / Stats Panel */}
      <section 
        className="hero-section"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,14,0.03) 0%, rgba(20,18,14,0) 100%)",
          padding: "48px 0 24px 0",
          borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))"
        }}
      >
        <div className="estrella-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="pill-badge" style={{ background: "rgba(180,140,90,0.1)", color: "#b48c5a", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Orior CRM Live Sync
                </span>
                <span style={{ fontSize: 12, color: "var(--brand-text-muted)" }}>
                  CDN Generated: {generatedAt}
                </span>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 42px)", margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
                CRM Products & CDN Asset Explorer
              </h1>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--brand-text-secondary)", margin: "8px 0 0 0", maxWidth: 650 }}>
                A visual dashboard bridging live Orior CRM stock list (`STOCK_MTO`) with matching multi-angle renders and 360° spin videos on Bunny CDN.
              </p>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div className="metric-box" style={{ background: "var(--brand-bg)", border: "1px solid var(--brand-border, rgba(0,0,0,0.08))", padding: "16px 24px", borderRadius: 12, minWidth: 140 }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-text-muted)", display: "block" }}>Total CRM Products</span>
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, color: "var(--brand-text-primary)" }}>{products.length}</strong>
              </div>
              <div className="metric-box" style={{ background: "var(--brand-bg)", border: "1px solid var(--brand-border, rgba(0,0,0,0.08))", padding: "16px 24px", borderRadius: 12, minWidth: 140 }}>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-text-muted)", display: "block" }}>CDN Mapped</span>
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 400, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  {products.filter(p => p.cdn?.cdnOk).length}
                  <CheckCircle2 size={20} style={{ color: "#10b981" }} />
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter / Search Panel */}
      <section style={{ padding: "32px 0", background: "var(--brand-bg)" }}>
        <div className="estrella-container">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Search + CDN Status */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }}>
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search by SKU, Title, description, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 48px",
                    background: "rgba(0, 0, 0, 0.02)",
                    border: "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "var(--brand-text-primary)",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "border-color 0.2s"
                  }}
                  className="search-input"
                />
              </div>

              {/* CDN Status filter */}
              <div style={{ display: "flex", border: "1px solid var(--brand-border, rgba(0,0,0,0.12))", borderRadius: 8, overflow: "hidden" }}>
                <button
                  onClick={() => setCdnStatusFilter("ALL")}
                  style={{
                    padding: "0 16px",
                    background: cdnStatusFilter === "ALL" ? "var(--brand-text-primary)" : "transparent",
                    color: cdnStatusFilter === "ALL" ? "var(--brand-bg)" : "var(--brand-text-primary)",
                    border: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  All Assets
                </button>
                <button
                  onClick={() => setCdnStatusFilter("OK")}
                  style={{
                    padding: "0 16px",
                    background: cdnStatusFilter === "OK" ? "#10b981" : "transparent",
                    color: cdnStatusFilter === "OK" ? "#fff" : "var(--brand-text-primary)",
                    border: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    borderLeft: "1px solid var(--brand-border, rgba(0,0,0,0.12))"
                  }}
                >
                  CDN Linked
                </button>
                <button
                  onClick={() => setCdnStatusFilter("MISSING")}
                  style={{
                    padding: "0 16px",
                    background: cdnStatusFilter === "MISSING" ? "#ef4444" : "transparent",
                    color: cdnStatusFilter === "MISSING" ? "#fff" : "var(--brand-text-primary)",
                    border: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    borderLeft: "1px solid var(--brand-border, rgba(0,0,0,0.12))"
                  }}
                >
                  Missing
                </button>
              </div>
            </div>

            {/* Dropdown Filters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {/* Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.05em" }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                    background: "transparent",
                    color: "var(--brand-text-primary)",
                    fontSize: 13,
                    outline: "none"
                  }}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Shape */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.05em" }}>Diamond Shape</label>
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                    background: "transparent",
                    color: "var(--brand-text-primary)",
                    fontSize: 13,
                    outline: "none"
                  }}
                >
                  {shapes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Collection */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.05em" }}>Collection</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                    background: "transparent",
                    color: "var(--brand-text-primary)",
                    fontSize: 13,
                    outline: "none"
                  }}
                >
                  {collections.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Metal Renders Filter */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.05em" }}>Metal Color Render</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["ALL", "RG", "WG", "YG"] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => setMetalColorFilter(color)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        borderRadius: 6,
                        border: metalColorFilter === color ? "1.5px solid var(--brand-text-primary)" : "1px solid var(--brand-border, rgba(0,0,0,0.12))",
                        background: metalColorFilter === color ? "rgba(20,18,14,0.05)" : "transparent",
                        color: "var(--brand-text-primary)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results metadata */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--brand-text-muted)", borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.06))", paddingTop: 16 }}>
              <span>Showing <strong>{filteredProducts.length}</strong> of {products.length} products</span>
              {filteredProducts.length === 0 && <span>No products match the filters. Try broadening your query.</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Products */}
      <section style={{ padding: "0 0 80px 0", background: "var(--brand-bg)" }}>
        <div className="estrella-container">
          <div className="catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
            {filteredProducts.map((prod) => {
              const id = prod.id;
              const currentMetal = gridMetalColors[id] || (prod.cdn?.metalCodes[0] as "RG" | "WG" | "YG") || "WG";
              const currentKarat = gridKarats[id] || prod.crm.APPROX_MRP_LIST[0]?.KT || "18KT";
              
              // Resolve active price
              const mrpItem = prod.crm.APPROX_MRP_LIST.find(item => item.KT === currentKarat);
              const activePrice = mrpItem ? mrpItem.MRP : null;

              return (
                <div 
                  key={id}
                  className="product-card"
                  style={{
                    background: "var(--brand-bg)",
                    border: "1px solid var(--brand-border, rgba(0,0,0,0.08))",
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "transform 0.3s, box-shadow 0.3s"
                  }}
                >
                  {/* Metal Selector Buttons overlay */}
                  {prod.cdn && (
                    <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 6, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.06)" }}>
                      {prod.cdn.metalCodes.includes("RG") && (
                        <button 
                          onClick={() => setGridMetalColors(prev => ({ ...prev, [id]: "RG" }))}
                          style={{ width: 14, height: 14, borderRadius: "50%", background: "#eac0b0", border: currentMetal === "RG" ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)", cursor: "pointer", padding: 0 }}
                          title="Rose Gold Render"
                        />
                      )}
                      {prod.cdn.metalCodes.includes("WG") && (
                        <button 
                          onClick={() => setGridMetalColors(prev => ({ ...prev, [id]: "WG" }))}
                          style={{ width: 14, height: 14, borderRadius: "50%", background: "#e8e6e0", border: currentMetal === "WG" ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)", cursor: "pointer", padding: 0 }}
                          title="White Gold Render"
                        />
                      )}
                      {prod.cdn.metalCodes.includes("YG") && (
                        <button 
                          onClick={() => setGridMetalColors(prev => ({ ...prev, [id]: "YG" }))}
                          style={{ width: 14, height: 14, borderRadius: "50%", background: "#e9c25a", border: currentMetal === "YG" ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)", cursor: "pointer", padding: 0 }}
                          title="Yellow Gold Render"
                        />
                      )}
                    </div>
                  )}

                  {/* CDN status indicator */}
                  <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10 }}>
                    {prod.cdn?.cdnOk ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.9)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                        <CheckCircle2 size={10} /> CDN
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.9)", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                        <AlertCircle size={10} /> No CDN
                      </span>
                    )}
                  </div>

                  {/* Image container */}
                  <div 
                    onClick={() => openModal(prod)}
                    style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#fdfcfa", cursor: "pointer", overflow: "hidden" }}
                  >
                    <img
                      src={getGridProductImage(prod)}
                      alt={prod.crm.TITLE}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 12,
                        transition: "transform 0.5s ease"
                      }}
                      className="card-image"
                      loading="lazy"
                    />
                    <div className="card-hover-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.02)", opacity: 0, transition: "opacity 0.2s" }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1, borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.04))" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", letterSpacing: "0.06em", color: "var(--brand-text-muted)", textTransform: "uppercase" }}>
                        {prod.crm.CATEGORY}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-sans)", color: "var(--brand-text-muted)" }}>
                        {prod.crm.SHAPE}
                      </span>
                    </div>

                    <h3 
                      onClick={() => openModal(prod)}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 16,
                        margin: "0 0 12px 0",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        cursor: "pointer",
                        color: "var(--brand-text-primary)"
                      }}
                    >
                      {prod.crm.TITLE}
                    </h3>

                    {/* Weight & Diamond Details pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: 11, background: "rgba(0,0,0,0.03)", padding: "2px 8px", borderRadius: 4, color: "var(--brand-text-secondary)" }} title="Gross Weight / Net Weight">
                        Weight: {prod.crm.APPROX_GROSS_WT.toFixed(3)}g
                      </span>
                      {prod.crm.APPROX_DIA_WT > 0 && (
                        <span style={{ fontSize: 11, background: "rgba(180,140,90,0.06)", padding: "2px 8px", borderRadius: 4, color: "#9e7745" }} title="Diamond Carat Weight & Pieces">
                          Dia: {prod.crm.APPROX_DIA_WT.toFixed(3)}ct ({prod.crm.APPROX_DIA_PCS}p)
                        </span>
                      )}
                    </div>

                    {/* Pricing with Karat Selector */}
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 12 }}>
                      {/* Price display */}
                      <div>
                        {activePrice ? (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-text-muted)" }}>Price ({currentKarat})</span>
                            <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--brand-text-primary)", fontWeight: 500 }}>
                              {getFormatPrice(activePrice)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--brand-text-muted)" }}>No Price List</span>
                        )}
                      </div>

                      {/* Karat selector */}
                      <select
                        value={currentKarat}
                        onChange={(e) => setGridKarats(prev => ({ ...prev, [id]: e.target.value }))}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 4,
                          border: "1px solid var(--brand-border, rgba(0,0,0,0.1))",
                          background: "transparent",
                          color: "var(--brand-text-primary)",
                          fontSize: 11,
                          outline: "none"
                        }}
                      >
                        {prod.crm.APPROX_MRP_LIST.map(item => (
                          <option key={item.KT} value={item.KT}>{item.KT}</option>
                        ))}
                      </select>
                    </div>

                    {/* View CDN Button */}
                    <button
                      onClick={() => openModal(prod)}
                      style={{
                        marginTop: 14,
                        width: "100%",
                        padding: "8px 0",
                        background: "transparent",
                        border: "1px solid var(--brand-text-primary)",
                        color: "var(--brand-text-primary)",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "background 0.2s, color 0.2s"
                      }}
                      className="view-assets-btn"
                    >
                      <Maximize2 size={12} /> Inspect CDN Assets
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {activeProduct && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,18,14,0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={() => setActiveProduct(null)}
        >
          <div 
            style={{
              width: "100%",
              maxWidth: 1020,
              maxHeight: "90vh",
              background: "var(--brand-bg)",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))"
              }}
            >
              <div>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-text-muted)", display: "block" }}>
                  {activeProduct.crm.CATEGORY} &middot; {activeProduct.crm.SUB_CATEGORY}
                </span>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, margin: 0, fontWeight: 500, color: "var(--brand-text-primary)" }}>
                  {activeProduct.crm.TITLE}
                </h2>
              </div>
              <button 
                onClick={() => setActiveProduct(null)}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--brand-text-primary)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr" }} className="modal-grid">
              
              {/* Left Column: CDN Media Renders */}
              <div 
                style={{
                  padding: 24,
                  borderRight: "1px solid var(--brand-border, rgba(0,0,0,0.06))",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  background: "#fdfcfa"
                }}
              >
                {/* Media Header Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  {/* Metal Color Select Toggles */}
                  <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.03)", padding: 4, borderRadius: 8 }}>
                    {(["RG", "WG", "YG"] as const).map(color => {
                      const exists = activeProduct.cdn?.metalCodes.includes(color);
                      return (
                        <button
                          key={color}
                          disabled={!exists}
                          onClick={() => {
                            setActiveMetalColor(color);
                            // Adjust media tab if video isn't available
                            const metalBlock = activeProduct.cdn?.metals[color];
                            if (activeMediaTab === "video" && !metalBlock?.video) {
                              setActiveMediaTab("stills");
                            }
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: 0,
                            background: activeMetalColor === color ? "var(--brand-text-primary)" : "transparent",
                            color: activeMetalColor === color ? "var(--brand-bg)" : exists ? "var(--brand-text-primary)" : "rgba(0,0,0,0.25)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: exists ? "pointer" : "not-allowed",
                            opacity: exists ? 1 : 0.5
                          }}
                        >
                          {color === "RG" ? "Rose Gold" : color === "WG" ? "White Gold" : "Yellow Gold"}
                        </button>
                      );
                    })}
                  </div>

                  {/* Media Tab Toggles (Still images vs 360 Spin Video) */}
                  <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.03)", padding: 4, borderRadius: 8 }}>
                    <button
                      onClick={() => setActiveMediaTab("stills")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: 0,
                        background: activeMediaTab === "stills" ? "var(--brand-text-primary)" : "transparent",
                        color: activeMediaTab === "stills" ? "var(--brand-bg)" : "var(--brand-text-primary)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Gallery Still
                    </button>
                    <button
                      disabled={!activeProduct.cdn?.metals[activeMetalColor]?.video}
                      onClick={() => setActiveMediaTab("video")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: 0,
                        background: activeMediaTab === "video" ? "var(--brand-text-primary)" : "transparent",
                        color: activeMediaTab === "video" ? "var(--brand-bg)" : activeProduct.cdn?.metals[activeMetalColor]?.video ? "var(--brand-text-primary)" : "rgba(0,0,0,0.25)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: activeProduct.cdn?.metals[activeMetalColor]?.video ? "pointer" : "not-allowed",
                        opacity: activeProduct.cdn?.metals[activeMetalColor]?.video ? 1 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Play size={12} /> 360° Spin
                    </button>
                  </div>
                </div>

                {/* Main Media Viewer */}
                <div 
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "80%",
                    background: "#fbfbfb",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.05)",
                    overflow: "hidden"
                  }}
                >
                  {activeMediaTab === "stills" ? (
                    // Stills Gallery View
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                      {activeProduct.cdn && activeProduct.cdn.metals[activeMetalColor] ? (
                        (() => {
                          const block = activeProduct.cdn.metals[activeMetalColor];
                          const imageFile = block.card || block.main || block.gallery[0];
                          if (imageFile) {
                            const fullUrl = getAssetUrl(activeProduct.cdn.assetBase, imageFile);
                            return (
                              <img 
                                src={fullUrl} 
                                alt={`${activeProduct.crm.TITLE} in ${activeMetalColor}`} 
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            );
                          }
                          return <span>No image render available for this metal color.</span>;
                        })()
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--brand-text-muted)" }}>
                          <AlertCircle size={32} />
                          <span>No CDN renders linked. Standard placeholder shown.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Video Spin View
                    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
                      {activeProduct.cdn && activeProduct.cdn.metals[activeMetalColor]?.video ? (
                        (() => {
                          const videoFile = activeProduct.cdn.metals[activeMetalColor].video!;
                          const fullUrl = getAssetUrl(activeProduct.cdn.assetBase, videoFile);
                          return (
                            <video
                              key={fullUrl}
                              src={fullUrl}
                              loop
                              autoPlay
                              muted
                              controls
                              playsInline
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          );
                        })()
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#fff" }}>
                          No 360° video available.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Secondary Gallery (Thumbnail bar) */}
                {activeMediaTab === "stills" && activeProduct.cdn && activeProduct.cdn.metals[activeMetalColor] && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.05em" }}>
                      All Gallery Angles on Bunny CDN
                    </span>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                      {activeProduct.cdn.metals[activeMetalColor].gallery.map((file, idx) => {
                        const thumbUrl = getAssetUrl(activeProduct.cdn!.assetBase, file);
                        return (
                          <div 
                            key={idx}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 6,
                              overflow: "hidden",
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "#fff",
                              cursor: "pointer",
                              flexShrink: 0
                            }}
                            onClick={() => {
                              // We can make this replace the main image in a sub-state if wanted,
                              // but since it's just a diagnostic view, showing all is already great!
                            }}
                          >
                            <img src={thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: CRM Details & Specifications */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Description block */}
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Product Description
                  </h4>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, lineHeight: 1.6, color: "var(--brand-text-secondary)", margin: 0 }}>
                    {activeProduct.crm.DESCRIPTION || activeProduct.crm.POST_CONTENT || "No description provided."}
                  </p>
                </div>

                {/* Specs Table */}
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Technical Specifications
                  </h4>
                  <div style={{ border: "1px solid var(--brand-border, rgba(0,0,0,0.08))", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500, width: "40%" }}>SKU</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{activeProduct.crm.SKU}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>ECOM SKU</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{activeProduct.crm.ECOM_SKU}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Gross Weight</td>
                          <td style={{ padding: "8px 12px" }}>{activeProduct.crm.APPROX_GROSS_WT.toFixed(3)} g</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Net Gold Weight</td>
                          <td style={{ padding: "8px 12px" }}>{activeProduct.crm.APPROX_NET_WT.toFixed(3)} g</td>
                        </tr>
                        {activeProduct.crm.APPROX_DIA_WT > 0 && (
                          <>
                            <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                              <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Diamond Weight</td>
                              <td style={{ padding: "8px 12px" }}>{activeProduct.crm.APPROX_DIA_WT.toFixed(3)} Carat ({activeProduct.crm.APPROX_DIA_PCS} Pcs)</td>
                            </tr>
                            <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                              <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Diamond Quality</td>
                              <td style={{ padding: "8px 12px" }}>{activeProduct.crm.APPROX_DIA_QLTY} ({activeProduct.crm.DIA_COLOR} / {activeProduct.crm.DIA_CLARITY})</td>
                            </tr>
                          </>
                        )}
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Shape</td>
                          <td style={{ padding: "8px 12px" }}>{activeProduct.crm.SHAPE || "Agnostic"}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid var(--brand-border, rgba(0,0,0,0.06))" }}>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Occasion</td>
                          <td style={{ padding: "8px 12px" }}>{activeProduct.crm.OCCASSION}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)", fontWeight: 500 }}>Collection</td>
                          <td style={{ padding: "8px 12px" }}>{activeProduct.crm.COLLECTION}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Price Matrix */}
                <div style={{ background: "rgba(180,140,90,0.04)", border: "1px solid rgba(180,140,90,0.15)", borderRadius: 8, padding: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "#b48c5a", letterSpacing: "0.08em", margin: "0 0 12px 0" }}>
                    CRM Price Matrix (MRP)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {activeProduct.crm.APPROX_MRP_LIST.map((item) => (
                      <div 
                        key={item.KT}
                        onClick={() => setActiveKarat(item.KT)}
                        style={{
                          textAlign: "center",
                          padding: "8px 4px",
                          borderRadius: 6,
                          border: activeKarat === item.KT ? "1.5px solid #b48c5a" : "1px solid rgba(0,0,0,0.06)",
                          background: activeKarat === item.KT ? "#fff" : "transparent",
                          cursor: "pointer",
                          transition: "border-color 0.2s"
                        }}
                      >
                        <span style={{ fontSize: 10, display: "block", color: "var(--brand-text-muted)" }}>{item.KT}</span>
                        <strong style={{ fontSize: 13, color: "var(--brand-text-primary)" }}>{getFormatPrice(item.MRP)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bunny CDN Diagnostic Details */}
                <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--brand-border, rgba(0,0,0,0.08))", borderRadius: 8, padding: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--brand-text-muted)", letterSpacing: "0.08em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <Info size={14} /> Bunny CDN Mapping Details
                  </h4>
                  {activeProduct.cdn ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                      <div>
                        <span style={{ color: "var(--brand-text-muted)" }}>Storage Folder:</span>
                        <code style={{ display: "block", background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: 4, marginTop: 2, overflowX: "auto" }}>
                          {activeProduct.cdn.bunnyFolder}
                        </code>
                      </div>
                      <div>
                        <span style={{ color: "var(--brand-text-muted)" }}>Full Pull-Zone URL:</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                          <code style={{ flex: 1, background: "rgba(0,0,0,0.04)", padding: "4px 8px", borderRadius: 4, overflowX: "auto", whiteSpace: "nowrap" }}>
                            {(() => {
                              const block = activeProduct.cdn.metals[activeMetalColor];
                              const img = block?.card || block?.main || block?.gallery[0];
                              return img ? getAssetUrl(activeProduct.cdn.assetBase, img) : "No URL";
                            })()}
                          </code>
                          <button
                            onClick={() => {
                              const block = activeProduct.cdn!.metals[activeMetalColor];
                              const img = block?.card || block?.main || block?.gallery[0];
                              if (img) copyToClipboard(getAssetUrl(activeProduct.cdn!.assetBase, img));
                            }}
                            style={{
                              background: "#fff",
                              border: "1px solid rgba(0,0,0,0.12)",
                              borderRadius: 4,
                              padding: 4,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center"
                            }}
                            title="Copy CDN URL"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        {copiedUrl && <span style={{ fontSize: 10, color: "#10b981", display: "block", marginTop: 2 }}>Copied to clipboard!</span>}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--brand-text-muted)" }}>This item is not mapped to any Bunny CDN folders.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div 
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderTop: "1px solid var(--brand-border, rgba(0,0,0,0.06))",
                background: "rgba(0,0,0,0.01)"
              }}
            >
              <div style={{ fontSize: 12, color: "var(--brand-text-muted)" }}>
                SKU: <strong style={{ color: "var(--brand-text-primary)" }}>{activeProduct.crm.SKU}</strong> &middot; ECOM: <strong style={{ color: "var(--brand-text-primary)" }}>{activeProduct.crm.ECOM_SKU}</strong>
              </div>
              <button
                onClick={() => {
                  if (activeProduct.cdn) {
                    const block = activeProduct.cdn.metals[activeMetalColor];
                    const img = block?.card || block?.main || block?.gallery[0];
                    if (img) window.open(getAssetUrl(activeProduct.cdn.assetBase, img), "_blank");
                  }
                }}
                disabled={!activeProduct.cdn}
                style={{
                  padding: "8px 16px",
                  background: activeProduct.cdn ? "var(--brand-text-primary)" : "rgba(0,0,0,0.05)",
                  color: activeProduct.cdn ? "var(--brand-bg)" : "rgba(0,0,0,0.25)",
                  border: 0,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: activeProduct.cdn ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                Open Original in New Tab <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS styles */}
      <style jsx global>{`
        .modal-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }
        @media (max-width: 768px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08);
        }
        .product-card:hover .card-image {
          transform: scale(1.03);
        }
        .product-card:hover .card-hover-overlay {
          opacity: 1;
        }
        .view-assets-btn:hover {
          background: var(--brand-text-primary) !important;
          color: var(--brand-bg) !important;
        }
      `}</style>
    </div>
  );
}
