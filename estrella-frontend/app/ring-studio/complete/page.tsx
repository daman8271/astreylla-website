import { redirect } from "next/navigation";
import { StageComplete } from "@/components/ring-studio/StageComplete";

export default function RingStudioCompletePage({
  searchParams,
}: {
  searchParams: { diamondId?: string; settingSku?: string };
}) {
  if (!searchParams.diamondId) {
    redirect("/ring-studio/diamond");
  }
  if (!searchParams.settingSku) {
    redirect(`/ring-studio/setting?diamondId=${encodeURIComponent(searchParams.diamondId)}`);
  }
  return <StageComplete />;
}
