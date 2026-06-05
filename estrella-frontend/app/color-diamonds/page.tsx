import { ComingSoonShowcase } from "@/components/ComingSoonShowcase";

export const metadata = {
  title: "Fancy Color Diamonds — Astreylla",
  description: "Fancy color lab-grown diamonds. Arriving soon.",
};

const FANCY_DIAMOND_PREVIEWS = [
  {
    name: "Canary Yellow",
    shape: "Radiant",
    description: "A vivid, sun-drenched yellow diamond radiating warmth and unparalleled brilliance. A statement of pure luxury.",
    colorHex: "#fadf66",
    gradient: "linear-gradient(135deg, #ffe066 0%, #e8c044 100%)",
  },
  {
    name: "Blushing Pink",
    shape: "Pear",
    description: "A delicate, romantic rose-tinted pink diamond. Exquisitely cut to capture light in soft, glistening pink hues.",
    colorHex: "#f7c4d2",
    gradient: "linear-gradient(135deg, #ffccd5 0%, #ec97b3 100%)",
  },
  {
    name: "Royal Azure Blue",
    shape: "Oval",
    description: "An ocean-deep fancy blue diamond, extremely rare and mysterious. Captivates with its cool, hypnotic depth.",
    colorHex: "#5a86d6",
    gradient: "linear-gradient(135deg, #729fcf 0%, #2f5fb5 100%)",
  },
];

export default function ColorDiamondsPage() {
  return (
    <ComingSoonShowcase
      title="Fancy Color Diamonds"
      subtitle="Coming Soon"
      description="Our hand-selected fancy yellow, blushing pink, and royal blue lab-grown diamonds are arriving soon. In the meantime, browse our exquisite colorless settings and rings."
      type="diamonds"
      previews={FANCY_DIAMOND_PREVIEWS}
    />
  );
}
