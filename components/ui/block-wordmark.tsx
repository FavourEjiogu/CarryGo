"use client";

import { loadFont as loadUltra } from "@remotion/google-fonts/Ultra";
import { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { mixOklch, resolveFont, type SnapCnTheme, useSnapCnTheme } from "@/components/ui/block-wordmark-utils/index";

const { fontFamily: ULTRA, waitUntilDone: ultraReady } = loadUltra("normal", { weights: ["400"], subsets: ["latin"] });
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SPIN_EASE = Easing.bezier(0.76, 0, 0.24, 1);
const OUT_EASE = Easing.out(Easing.cubic);
const IN_EASE = Easing.in(Easing.cubic);

type Tab = { height: number; x: number; width: number };
type Glyph = { ch: string; blank: boolean; advance: number; tab: Tab | null };
type Metrics = { glyphs: Glyph[]; xHeight: number; baselineOffset: number };

function measureGlyphs(characters: string[], face: string, weight: number | string, size: number): Metrics {
  const fallback: Metrics = {
    xHeight: size * 0.52,
    baselineOffset: size * 0.86,
    glyphs: characters.map((ch) => ({ ch, blank: ch.trim() === "", advance: size * (ch === " " ? 0.32 : 0.56), tab: null })),
  };
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(size * 3);
  canvas.height = Math.ceil(size * 3);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.font = String(weight) + " " + size + "px " + JSON.stringify(face);
  ctx.textBaseline = "alphabetic";
  const xHeight = ctx.measureText("x").actualBoundingBoxAscent;
  const capHeight = ctx.measureText("H").actualBoundingBoxAscent;
  if (!(xHeight > 0) || !(capHeight > xHeight)) return fallback;
  const threshold = (capHeight - xHeight) * 0.15;
  const origin = size * 0.5;
  const baseline = Math.round(size * 2);
  const tabByCharacter = new Map<string, Tab>();

  for (const character of Array.from(new Set(characters.filter((ch) => ch.trim() !== "")))) {
    const box = ctx.measureText(character);
    const height = box.actualBoundingBoxAscent - xHeight;
    if (!(height > threshold)) continue;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillText(character, origin, baseline);
    const top = Math.max(0, Math.floor(baseline - box.actualBoundingBoxAscent));
    const sampleHeight = Math.max(1, Math.ceil(height * 0.6));
    const pixels = ctx.getImageData(0, top, canvas.width, Math.min(sampleHeight, canvas.height - top)).data;
    let lo = Number.POSITIVE_INFINITY;
    let hi = Number.NEGATIVE_INFINITY;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] <= 8) continue;
      const x = (i >> 2) % canvas.width;
      if (x < lo) lo = x;
      if (x > hi) hi = x;
    }
    const inkWidth = box.actualBoundingBoxLeft + box.actualBoundingBoxRight;
    if (lo === Number.POSITIVE_INFINITY || !(inkWidth > 0)) continue;
    const inkLeft = origin - box.actualBoundingBoxLeft;
    tabByCharacter.set(character, {
      height,
      x: Math.max(0, (lo - inkLeft) / inkWidth),
      width: Math.min(1, (hi - lo + 1) / inkWidth),
    });
  }

  return {
    xHeight,
    baselineOffset: size * 0.86,
    glyphs: characters.map((ch) => {
      const measured = ctx.measureText(ch);
      return {
        ch,
        blank: ch.trim() === "",
        advance: measured.width || (ch === " " ? size * 0.32 : size * 0.56),
        tab: tabByCharacter.get(ch) ?? null,
      };
    }),
  };
}

function defaultColors(theme: SnapCnTheme): string[] {
  return [
    theme.primary,
    mixOklch(theme.primary, "#000000", 0.3),
    mixOklch(theme.primary, "#ffffff", 0.28),
    mixOklch(theme.primary, "#000000", 0.55),
    mixOklch(theme.primary, "#ffffff", 0.52),
  ];
}

export interface BlockWordmarkProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  colors?: string[] | string;
  background?: string;
  blockGap?: number;
  cornerRadius?: number;
  ascenderRatio?: number;
  ascenderStemRatio?: number;
  blockSizing?: "square" | "glyph";
  maxWidth?: number;
  cards?: number;
  cardStagger?: number;
  spinTurns?: number;
  liftRatio?: number;
  growDuration?: number;
  spinDuration?: number;
  splitDuration?: number;
  splitStagger?: number;
  ascenderDuration?: number;
  holdDuration?: number;
  flashStagger?: number;
  flashDuration?: number;
  flashToSwap?: number;
  speed?: number;
  className?: string;
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
}

/** A block deck that fans out, forms a word, flashes the letter tiles, then resolves to type. */
export function BlockWordmark({
  text = "base",
  fontSize = 160,
  fontFamily,
  fontWeight = 400,
  color,
  colors,
  background,
  blockGap = 0.093,
  cornerRadius = 0.18,
  ascenderRatio,
  ascenderStemRatio,
  blockSizing = "square",
  maxWidth = 0.92,
  cards = 6,
  cardStagger = 2,
  spinTurns = 1,
  liftRatio = 0.665,
  growDuration = 9,
  spinDuration = 33,
  splitDuration = 5,
  splitStagger = 1,
  ascenderDuration = 12,
  holdDuration = 54,
  flashStagger = 4,
  flashDuration = 3,
  flashToSwap = 5,
  speed = 1,
  className,
  theme,
  mode,
}: BlockWordmarkProps) {
  const frame = useCurrentFrame() * speed;
  const { width, height, fps } = useVideoConfig();
  const tokens = useSnapCnTheme(theme, mode);
  const face = resolveFont(fontFamily ?? tokens.fontFamily) ?? ULTRA;
  const ink = color ?? tokens.foreground;
  const stage = background ?? tokens.background;
  const palette = (typeof colors === "string" ? colors.split(",").map((entry) => entry.trim()).filter(Boolean) : colors) ?? defaultColors(tokens);
  const deck = palette.length ? palette : defaultColors(tokens);
  const characters = Array.from(text);
  const [handle] = useState(() => delayRender("block-wordmark: measure glyphs"));
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setMetrics(measureGlyphs(Array.from(text), face, fontWeight, fontSize));
    };
    Promise.all([
      ultraReady(),
      typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve(),
    ]).then(run, run);
    return () => { cancelled = true; };
  }, [handle, text, face, fontWeight, fontSize]);

  useEffect(() => {
    if (metrics) continueRender(handle);
  }, [metrics, handle]);

  const glyphs = metrics?.glyphs ?? characters.map((ch) => ({
    ch,
    blank: ch.trim() === "",
    advance: fontSize * (ch === " " ? 0.32 : 0.56),
    tab: null as Tab | null,
  }));
  const xHeight = metrics?.xHeight ?? fontSize * 0.52;
  const baselineOffset = metrics?.baselineOffset ?? fontSize * 0.86;
  const letterEnds: number[] = [];
  let letterRun = 0;
  for (const glyph of glyphs) {
    letterEnds.push(letterRun);
    letterRun += glyph.advance;
  }
  const letterTotal = letterRun;
  const gapPx = blockGap * xHeight;
  const blockGlyph: number[] = [];
  const blockStarts: number[] = [];
  const blockWidths: number[] = [];
  const blockOf: number[] = [];
  let blockRun = 0;
  let prevWasBlock = false;
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    if (glyph.blank) {
      blockRun += glyph.advance;
      prevWasBlock = false;
      blockOf.push(-1);
      continue;
    }
    if (prevWasBlock) blockRun += gapPx;
    blockOf.push(blockGlyph.length);
    blockGlyph.push(i);
    blockStarts.push(blockRun);
    const blockWidth = blockSizing === "glyph" ? glyph.advance : xHeight;
    blockWidths.push(blockWidth);
    blockRun += blockWidth;
    prevWasBlock = true;
  }
  const blockTotal = blockRun;
  const fit = Math.min(1, (width * maxWidth) / Math.max(1, letterTotal, blockTotal));
  const side = xHeight * fit;
  const radius = cornerRadius * side;
  const cx = width / 2;
  const tabHeightOf = (glyph: Glyph) => glyph.tab === null
    ? 0
    : ascenderRatio === undefined ? glyph.tab.height * fit : ascenderRatio * side;
  const rowTop = side + Math.max(0, ...blockGlyph.map((index) => tabHeightOf(glyphs[index])));
  const baselineY = height / 2 + rowTop / 2;
  const letterLeft = (width - letterTotal * fit) / 2;
  const blockLeft = (width - blockTotal * fit) / 2;
  const nCards = Math.max(1, Math.round(cards));
  const collapseAt = Math.round(spinDuration + (cardStagger * (nCards - 1)) / 2);
  const splitStart = collapseAt + 2;
  const ascenderStart = splitStart + 2;
  const resolveStart = splitStart + holdDuration;
  const grow = interpolate(frame, [0, Math.max(1, growDuration)], [0, 1], { ...CLAMP, easing: OUT_EASE });
  const turn = (card: number) => {
    const start = card * cardStagger;
    const span = Math.max(1, Math.min(spinDuration, collapseAt - start));
    return interpolate(frame - start, [0, span], [0, 360 * spinTurns], { ...CLAMP, easing: SPIN_EASE });
  };
  const lift = liftRatio * side * (spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: { damping: 60, stiffness: 330, mass: 1 },
  }) - interpolate(frame, [collapseAt - 9, collapseAt], [0, 1], { ...CLAMP, easing: IN_EASE }));
  const dip = interpolate(frame, [collapseAt, collapseAt + 1, collapseAt + 3], [0, 1, 0], CLAMP);
  const splitRank = (index: number) => {
    const mid = (blockWidths.length - 1) / 2;
    return Math.round(mid - Math.abs(index - mid));
  };
  const splitProgress = (index: number) => interpolate(
    frame - splitStart - splitRank(index) * splitStagger,
    [0, Math.max(1, splitDuration)],
    [0, 1],
    { ...CLAMP, easing: OUT_EASE },
  );
  const tabGrow = interpolate(frame, [ascenderStart, ascenderStart + Math.max(1, ascenderDuration)], [0, 1], { ...CLAMP, easing: OUT_EASE });
  const order: number[] = [];
  for (let i = 1; i < blockWidths.length; i++) order.push(i);
  if (blockWidths.length) order.push(0);
  const cue = new Map<number, number>();
  const flashOf = new Map<number, string>();
  order.forEach((index, position) => {
    cue.set(index, position === 0 ? 0 : flashStagger * position - flashStagger / 2);
    flashOf.set(index, deck[position % deck.length]);
  });
  const squareLeft = cx - side / 2;

  return (
    <AbsoluteFill className={className} style={{
      backgroundColor: stage,
      overflow: "hidden",
      fontFamily: face,
      fontWeight,
      textRendering: "geometricPrecision",
    }}>
      <AbsoluteFill style={{
        opacity: metrics ? 1 : 0,
        transformOrigin: "50% " + baselineY + "px",
        transform: "translateY(" + (-lift - dip * side * 0.03) + "px) scaleY(" + (1 - dip * 0.013) + ")",
      }}>
        {frame < collapseAt + 1 && Array.from({ length: nCards - 1 }, (_, i) => nCards - 1 - i).map((card) => (
          <div key={"card-" + card} style={{
            position: "absolute",
            left: squareLeft,
            top: baselineY - side,
            width: side,
            height: side,
            borderRadius: radius,
            backgroundColor: deck[(card - 1 + deck.length) % deck.length],
            transformOrigin: "50% 100%",
            transform: "rotate(" + turn(card) + "deg) scale(" + grow + ")",
          }} />
        ))}
        {blockWidths.map((blockWidth, index) => {
          const progress = splitProgress(index);
          const glyph = glyphs[blockGlyph[index]];
          const swapAt = resolveStart + (cue.get(index) ?? 0) + flashToSwap;
          if (frame >= swapAt) return null;
          const flashAt = resolveStart + (cue.get(index) ?? 0);
          const flashing = frame >= flashAt && frame < flashAt + flashDuration;
          const fill = flashing ? (flashOf.get(index) ?? ink) : ink;
          const left = squareLeft + (blockLeft + blockStarts[index] * fit - squareLeft) * progress;
          const blockW = side + (blockWidth * fit - side) * progress;
          const tab = glyph?.tab ?? null;
          const tabH = tab ? tabGrow * tabHeightOf(glyph) : 0;
          const tabW = tab ? blockW * (ascenderStemRatio ?? tab.width) : 0;
          const tabX = tab ? Math.min(Math.max(0, tab.x * blockW), Math.max(0, blockW - tabW)) : 0;
          const notched = tabH > radius;
          return (
            <div key={"block-" + index} style={{
              position: "absolute",
              left,
              top: baselineY - side,
              width: blockW,
              height: side,
              borderRadius: radius,
              borderTopLeftRadius: notched && tabX < 1 ? 0 : radius,
              borderTopRightRadius: notched && tabX + tabW > blockW - 1 ? 0 : radius,
              backgroundColor: fill,
              transformOrigin: "50% 100%",
              transform: "rotate(" + turn(0) + "deg) scale(" + grow + ")",
            }}>
              {tabH > 0 && <div style={{
                position: "absolute",
                bottom: "100%",
                left: tabX,
                width: tabW,
                height: tabH,
                backgroundColor: fill,
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
              }} />}
            </div>
          );
        })}
        {glyphs.map((glyph, index) => {
          const blockIndex = blockOf[index];
          if (blockIndex < 0) return null;
          const swapAt = resolveStart + (cue.get(blockIndex) ?? 0) + flashToSwap;
          if (frame < swapAt) return null;
          return <span key={"letter-" + index} style={{
            position: "absolute",
            left: letterLeft + letterEnds[index] * fit,
            top: baselineY - baselineOffset * fit,
            width: glyph.advance * fit,
            fontSize: fontSize * fit,
            lineHeight: 1,
            whiteSpace: "pre",
            color: ink,
          }}>{glyph.ch}</span>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export default BlockWordmark;
