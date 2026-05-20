import "@/components/ring-studio/ring-studio.css";
import { RingStudioShell } from "@/components/ring-studio/RingStudioShell";

export const metadata = {
  title: "Ring Studio — Astreylla",
  description: "Design your engagement ring: choose a diamond, choose a setting, complete your ring.",
};

export default function RingStudioLayout({ children }: { children: React.ReactNode }) {
  return <RingStudioShell>{children}</RingStudioShell>;
}
