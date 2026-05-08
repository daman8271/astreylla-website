import "@/components/diamonds/diamonds.css";
import { redirect } from "next/navigation";
import { StageSetting } from "@/components/ring-studio/StageSetting";

export default function RingStudioSettingPage({
  searchParams,
}: {
  searchParams: { diamondId?: string };
}) {
  if (!searchParams.diamondId) {
    redirect("/ring-studio/diamond");
  }
  return <StageSetting />;
}
