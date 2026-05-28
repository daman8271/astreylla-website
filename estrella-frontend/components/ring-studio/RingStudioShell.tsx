"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { RingStudioProvider } from "./RingStudioContext";
import { RingStudioHydrator } from "./RingStudioHydrator";
import { RingStudioStepper, type Stage } from "./RingStudioStepper";

function stageFromPath(p: string): Stage {
  if (p.endsWith("/setting")) return "setting";
  if (p.endsWith("/complete")) return "complete";
  return "diamond";
}

export function RingStudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/ring-studio/setting";
  const stage = stageFromPath(pathname);
  return (
    <RingStudioProvider>
      <Suspense fallback={null}>
        <RingStudioHydrator />
      </Suspense>
      <div className="rs-shell">
        <header className="rs-pagehead">
          <h1 className="rs-pagehead__title">
            <span style={{ fontStyle: "italic" }}>Ring Studio</span>
          </h1>
          <p className="rs-pagehead__sub">
            All rings shown in the <em>ring studio</em> have a <strong>1.5ct diamond</strong> centre stone.
          </p>
        </header>

        <RingStudioStepper current={stage} />

        <div className="rs-stage">{children}</div>
      </div>
    </RingStudioProvider>
  );
}
