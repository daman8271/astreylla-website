export type RingSize = { label: string; value: string };
export type RegionCode = "US" | "UK" | "EU" | "AU" | "JP" | "NOT_SURE";
export type RingSizeRegion = {
  code: RegionCode;
  label: string;
  sizes: RingSize[];
};

function usSizes(): RingSize[] {
  const out: RingSize[] = [];
  for (let s = 3; s <= 13; s += 0.5) {
    const label = s % 1 === 0 ? `${s}` : `${s}`;
    out.push({ label, value: label });
  }
  return out;
}

function ukSizes(): RingSize[] {
  // A through Z, plus half steps using ½, plus Z+1..Z+5.
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const out: RingSize[] = [];
  for (const ch of letters) {
    out.push({ label: ch, value: ch });
    out.push({ label: `${ch}½`, value: `${ch}.5` });
  }
  for (let i = 1; i <= 5; i++) {
    out.push({ label: `Z+${i}`, value: `Z+${i}` });
  }
  return out;
}

function euSizes(): RingSize[] {
  const out: RingSize[] = [];
  for (let s = 44; s <= 66; s++) {
    out.push({ label: `${s}`, value: `${s}` });
  }
  return out;
}

function jpSizes(): RingSize[] {
  const out: RingSize[] = [];
  for (let s = 1; s <= 27; s++) {
    out.push({ label: `${s}`, value: `${s}` });
  }
  return out;
}

export const REGIONS: RingSizeRegion[] = [
  { code: "US", label: "United States", sizes: usSizes() },
  { code: "UK", label: "United Kingdom", sizes: ukSizes() },
  { code: "EU", label: "Europe", sizes: euSizes() },
  { code: "AU", label: "Australia", sizes: ukSizes() },
  { code: "JP", label: "Japan", sizes: jpSizes() },
  {
    code: "NOT_SURE",
    label: "I'm not sure",
    sizes: [{ label: "Standard (US 6.5 / UK M)", value: "STANDARD" }],
  },
];

export function getRegion(code: RegionCode): RingSizeRegion | undefined {
  return REGIONS.find((r) => r.code === code);
}
