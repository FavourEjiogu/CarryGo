"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto" | "center";

export type TourStep = {
  target?: string;
  title: string;
  content: React.ReactNode;
  placement?: TourPlacement;
  padding?: number;
};

export type TourProps = {
  steps: TourStep[];
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  onIndexChange?: (index: number) => void;
  onFinish?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  clickToNext?: boolean;
  dark?: boolean;
  className?: string;
};

type Rect = { top: number; left: number; width: number; height: number };
const SPRING = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.7 };

function findVisibleTarget(selector?: string): HTMLElement | null {
  if (!selector || typeof document === "undefined") return null;
  try {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).find(
      (element) => element.isConnected && element.getClientRects().length > 0 &&
        element.getAttribute("aria-hidden") !== "true",
    ) ?? null;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), Math.max(min, max));
}

export function Tour({
  steps,
  open,
  onOpenChange,
  index: controlledIndex,
  onIndexChange,
  onFinish,
  onSkip,
  showProgress = true,
  clickToNext = false,
  dark,
  className,
}: TourProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [indexState, setIndexState] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [cardSize, setCardSize] = React.useState({ w: 320, h: 190 });
  const [vp, setVp] = React.useState({ w: 1024, h: 768 });
  const cardRef = React.useRef<HTMLDivElement>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const index = controlledIndex ?? indexState;
  const step = steps[index];
  const count = steps.length;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const pad = step?.padding ?? 8;

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setIndex = React.useCallback((nextIndex: number) => {
    const next = Math.min(Math.max(0, nextIndex), Math.max(0, steps.length - 1));
    onIndexChange?.(next);
    setIndexState(next);
  }, [onIndexChange, steps.length]);

  const finish = React.useCallback(() => {
    onFinish?.();
    onOpenChange?.(false);
    setIndex(0);
  }, [onFinish, onOpenChange, setIndex]);

  const skip = React.useCallback(() => {
    onSkip?.();
    onOpenChange?.(false);
    setIndex(0);
  }, [onSkip, onOpenChange, setIndex]);

  const next = React.useCallback(() => {
    if (isLast) finish();
    else setIndex(index + 1);
  }, [finish, index, isLast, setIndex]);

  const back = React.useCallback(() => {
    if (!isFirst) setIndex(index - 1);
  }, [index, isFirst, setIndex]);

  React.useEffect(() => {
    if (!open || !step || !mounted) return;
    let settle = 0;
    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      if (!step.target) {
        setRect(null);
        return;
      }
      const element = findVisibleTarget(step.target);
      if (!element?.isConnected) {
        setRect(null);
        return;
      }
      const bounds = element.getBoundingClientRect();
      setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height });
    };

    const target = findVisibleTarget(step.target);
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center", inline: "nearest" });
    measure();
    settle = window.setTimeout(measure, reduce ? 0 : 340);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [mounted, open, index, step, reduce]);

  React.useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    const measure = () => {
      const bounds = cardRef.current?.getBoundingClientRect();
      if (bounds) setCardSize({ w: bounds.width, h: bounds.height });
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (cardRef.current && observer) observer.observe(cardRef.current);
    return () => observer?.disconnect();
  }, [index, open, rect]);

  React.useEffect(() => {
    if (!open || !mounted) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => {
      cardRef.current?.querySelector<HTMLElement>("[data-tour-primary]")?.focus();
    }, 40);
    return () => window.clearTimeout(focusTimer);
  }, [mounted, open]);

  React.useEffect(() => {
    if (open || !mounted) return;
    const previous = returnFocusRef.current;
    returnFocusRef.current = null;
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  }, [mounted, open]);

  React.useEffect(() => {
    if (!open || !mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        back();
      } else if (event.key === "Tab") {
        const focusables = cardRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, [tabindex]:not([tabindex='-1'])",
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, next, back, skip, index]);

  if (!mounted || !open || !step || count === 0) return null;

  const isDark = dark ?? (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
  const gap = 14;
  let place: TourPlacement = step.placement ?? "auto";
  if (!rect) place = "center";
  if (place === "auto" && rect) {
    if (rect.top + rect.height + gap + cardSize.h < vp.h) place = "bottom";
    else if (rect.top - gap - cardSize.h > 0) place = "top";
    else if (rect.left + rect.width + gap + cardSize.w < vp.w) place = "right";
    else place = "left";
  }

  let left = vp.w / 2 - cardSize.w / 2;
  let top = vp.h / 2 - cardSize.h / 2;
  if (rect && place !== "center" && place !== "auto") {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (place === "bottom") {
      left = cx - cardSize.w / 2;
      top = rect.top + rect.height + gap + pad;
    } else if (place === "top") {
      left = cx - cardSize.w / 2;
      top = rect.top - gap - pad - cardSize.h;
    } else if (place === "right") {
      left = rect.left + rect.width + gap + pad;
      top = cy - cardSize.h / 2;
    } else if (place === "left") {
      left = rect.left - gap - pad - cardSize.w;
      top = cy - cardSize.h / 2;
    }
  }
  left = clamp(left, 12, vp.w - 12 - cardSize.w);
  top = clamp(top, 12, vp.h - 12 - cardSize.h);

  const spot = rect ? {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  } : null;
  const overlayInk = isDark ? "rgba(4,4,6,0.68)" : "rgba(17,17,20,0.52)";

  return createPortal(
    <div className={`${isDark ? "dark" : ""} ${className ?? ""}`}>
      <AnimatePresence>
        <motion.div
          key="tour-layer"
          className="fixed inset-0 z-[500]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={step.title}
        >
          <div className="absolute inset-0" onClick={() => clickToNext && next()} />
          {spot ? (
            <motion.div
              className="pointer-events-none absolute rounded-xl"
              initial={false}
              animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
              transition={reduce ? { duration: 0 } : SPRING}
              style={{
                boxShadow: `0 0 0 9999px ${overlayInk}`,
                outline: isDark ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.9)",
                outlineOffset: 2,
              }}
            >
              <span className="absolute inset-0 rounded-xl" style={{ boxShadow: isDark ? "0 0 0 1px rgba(255,255,255,0.2), 0 8px 40px rgba(0,0,0,0.5)" : "0 0 0 1px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.18)" }} />
            </motion.div>
          ) : (
            <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: overlayInk }} />
          )}

          <motion.div
            ref={cardRef}
            className="absolute w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl shadow-black/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, left, top }}
            transition={reduce ? { duration: 0 } : SPRING}
            style={{ left, top }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[14px] font-semibold leading-snug">{step.title}</h3>
              <button type="button" onClick={skip} aria-label="Close tour" className="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                <IconX />
              </button>
            </div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{step.content}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              {showProgress ? (
                <div className="flex items-center gap-1.5" aria-label={`Step ${index + 1} of ${count}`}>
                  {steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-zinc-900 dark:bg-zinc-100" : "w-1.5 bg-zinc-200 dark:bg-zinc-700"}`} />)}
                </div>
              ) : <span className="text-[11px] tabular-nums text-zinc-400">{index + 1} / {count}</span>}
              <div className="flex items-center gap-1.5">
                {!isFirst && <button type="button" onClick={back} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"><IconArrow className="rotate-180" />Back</button>}
                <button type="button" data-tour-primary onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900">
                  {isLast ? "Done" : "Next"}{!isLast && <IconArrow />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export function useTour(storageKey?: string) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const start = React.useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, []);
  const seen = React.useCallback(() => {
    if (!storageKey) return false;
    try { return localStorage.getItem(storageKey) === "1"; } catch { return false; }
  }, [storageKey]);
  const markSeen = React.useCallback(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, "1"); } catch { /* Storage can be disabled. */ }
  }, [storageKey]);
  return { open, setOpen, index, setIndex, start, seen, markSeen };
}

function IconX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}

function IconArrow({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 ${className}`}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
