"use client";

import { useMemo } from "react";

export type SnapCnTheme = {
  primary: string;
  background: string;
  foreground: string;
  fontFamily: string;
};

const lightTheme: SnapCnTheme = {
  primary: "#8B67FF",
  background: "#FFFEF9",
  foreground: "#0B0D0C",
  fontFamily: "Ultra",
};
const darkTheme: SnapCnTheme = {
  primary: "#B9FF35",
  background: "#0B0D0C",
  foreground: "#F3F3ED",
  fontFamily: "Ultra",
};

export function useSnapCnTheme(theme?: Partial<SnapCnTheme>, mode?: "light" | "dark"): SnapCnTheme {
  return useMemo(() => ({ ...(mode === "dark" ? darkTheme : lightTheme), ...theme }), [theme, mode]);
}
export function resolveFont(fontFamily?: string | null): string | null {
  const value = fontFamily?.trim();
  return value && value.length <= 160 ? value : null;
}
function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const expanded = raw.length === 3 ? raw.split("").map((x) => x + x).join("") : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return [0.5, 0.5, 0.5];
  return [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16) / 255) as [number, number, number];
}
function toLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}
function fromLinear(value: number): number {
  const v = Math.min(1, Math.max(0, value));
  return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
}
type Lab = { l: number; a: number; b: number };
function rgbToLab(hex: string): Lab {
  const [r0, g0, b0] = parseHex(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r0 + 0.5363325363 * g0 + 0.0514459929 * b0);
  const m = Math.cbrt(0.2119034982 * r0 + 0.6806995451 * g0 + 0.1073969566 * b0);
  const s = Math.cbrt(0.0883024619 * r0 + 0.2817188376 * g0 + 0.6299787005 * b0);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}
function labToHex(lab: Lab): string {
  const l = Math.pow(lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b, 3);
  const m = Math.pow(lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b, 3);
  const s = Math.pow(lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b, 3);
  const rgb = [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
  return "#" + rgb.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
}
/** Interpolates in OKLCH so the wordmark's cards stay on a coherent hue ramp. */
export function mixOklch(from: string, to: string, amount: number): string {
  const a = rgbToLab(from);
  const b = rgbToLab(to);
  const toLch = (lab: Lab) => ({ L: lab.l, C: Math.hypot(lab.a, lab.b), h: Math.atan2(lab.b, lab.a) });
  const first = toLch(a);
  const second = toLch(b);
  let hueDelta = second.h - first.h;
  if (hueDelta > Math.PI) hueDelta -= Math.PI * 2;
  if (hueDelta < -Math.PI) hueDelta += Math.PI * 2;
  const t = Math.min(1, Math.max(0, amount));
  const L = first.L + (second.L - first.L) * t;
  const C = first.C + (second.C - first.C) * t;
  const h = first.h + hueDelta * t;
  return labToHex({ l: L, a: C * Math.cos(h), b: C * Math.sin(h) });
}
