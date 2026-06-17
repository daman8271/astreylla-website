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
  const isReview = pathname.endsWith("/review");

  return (
    <RingStudioProvider>
      <Suspense fallback={null}>
        <RingStudioHydrator />
      </Suspense>
      <div className="rs-shell">
        {!isReview && (
          <header className="rs-pagehead" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 className="rs-pagehead__title">
              <span style={{ fontStyle: "italic" }}>Ring Studio</span>
            </h1>
            <p className="rs-pagehead__disclaimer" style={{
              fontSize: "14px",
              color: "var(--brand-text-muted, #7c776b)",
              marginTop: "6px",
              fontFamily: "var(--font-sans, system-ui), sans-serif",
              letterSpacing: "0.02em",
              textAlign: "center",
              maxWidth: "600px",
              fontWeight: "bold",
            }}>
              All rings shown in the ring studio have a 1.5ct diamond centre stone.
            </p>
          </header>
        )}

        {!isReview && <RingStudioStepper current={stage} />}

        <div className="rs-stage">{children}</div>
      </div>
    </RingStudioProvider>
  );
}
