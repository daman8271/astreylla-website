import { ComingSoonShowcase } from "@/components/ComingSoonShowcase";

export const metadata = {
  title: "Precious Gemstones — Astreylla",
  description: "Lab-grown rubies, emeralds, and sapphires. Arriving soon.",
};

const GEMSTONE_PREVIEWS = [
  {
    name: "Verdant Emerald",
    shape: "Emerald",
    description: "A rich, deep forest green emerald symbolizing growth and eternity. Grown to display spectacular clarity and fire.",
    colorHex: "#7fc06d",
    gradient: "linear-gradient(135deg, #a3e635 0%, #15803d 100%)",
  },
  {
    name: "Pigeon Blood Ruby",
    shape: "Cushion",
    description: "A passionate crimson-red ruby with an intense internal glow. A classic centerpiece of strength and romance.",
    colorHex: "#e74c4c",
    gradient: "linear-gradient(135deg, #f87171 0%, #b91c1c 100%)",
  },
  {
    name: "Velvet Blue Sapphire",
    shape: "Oval",
    description: "A midnight blue sapphire showing royal blue flashes under light. Epitomizes sophisticated elegance and wisdom.",
    colorHex: "#2f5fb5",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)",
  },
];

export default function GemstonesPage() {
  return (
    <ComingSoonShowcase
      title="Precious Gemstones"
      subtitle="Coming Soon"
      description="Our upcoming curation of ethically grown emeralds, rubies, and sapphires is landing soon. Discover the brilliance of colored gemstones designed for modern heirlooms."
      type="gemstones"
      previews={GEMSTONE_PREVIEWS}
    />
  );
}
