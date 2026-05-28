import { redirect } from "next/navigation";
import { StageComplete } from "@/components/ring-studio/StageComplete";

export default function RingStudioCompletePage({
  searchParams,
}: {
  searchParams: { diamondId?: string; settingSku?: string; metal?: string; shape?: string };
}) {
  if (!searchParams.settingSku) {
    redirect("/ring-studio/setting");
  }
  if (!searchParams.diamondId) {
    const sp = new URLSearchParams();
    sp.set("settingSku", searchParams.settingSku);
    if (searchParams.metal) sp.set("metal", searchParams.metal);
    if (searchParams.shape) sp.set("shape", searchParams.shape);
    redirect(`/ring-studio/diamond?${sp.toString()}`);
  }
  return <StageComplete />;
}
