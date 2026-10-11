"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const AnimatedWordmark = dynamic(() => import("@/components/ui/carrygo-wordmark-player"), {
  ssr: false,
  loading: () => <span className="brand-wordmark-static">CarryGo</span>,
});
const PLAYED_KEY = "carrygo:block-wordmark:played:v1";
type Mode = "checking" | "animated" | "static";

export function CarryGoWordmark() {
  const [mode, setMode] = useState<Mode>("checking");
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadyPlayed = false;
    try { alreadyPlayed = window.sessionStorage.getItem(PLAYED_KEY) === "1"; } catch { /* storage can be blocked */ }
    setMode(!reducedMotion && !alreadyPlayed ? "animated" : "static");
  }, []);
  const finish = useCallback(() => {
    try { window.sessionStorage.setItem(PLAYED_KEY, "1"); } catch { /* storage can be blocked */ }
    setMode("static");
  }, []);

  if (mode !== "animated") return <span className="brand-wordmark-static">CarryGo</span>;
  return (
    <span className="brand-wordmark-motion" aria-label="CarryGo">
      <span className="sr-only">CarryGo</span>
      <AnimatedWordmark onFinish={finish} />
    </span>
  );
}
