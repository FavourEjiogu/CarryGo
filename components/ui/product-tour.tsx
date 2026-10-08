"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

export type TourStep = {
  target?: string;
  title: string;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};
export type TourProps = {
  steps: TourStep[];
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onFinish?: () => void;
  onSkip?: () => void;
};

export function Tour({
  steps,
  open,
  onOpenChange,
  onFinish,
  onSkip,
}: TourProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const step = steps[index];

  const close = React.useCallback((finished = false) => {
    finished ? onFinish?.() : onSkip?.();
    onOpenChange?.(false);
    setIndex(0);
  }, [onFinish, onOpenChange, onSkip]);

  React.useEffect(() => {
    if (!open) return;

    const measure = () => {
      const element = step?.target
        ? (document.querySelector(step.target) as HTMLElement | null)
        : null;
      const nextRect = element?.getBoundingClientRect() ?? null;
      window.requestAnimationFrame(() => setRect(nextRect));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, index, step]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="CarryGo quick tour"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => document.querySelector<HTMLElement>('[role="dialog"][aria-label="CarryGo quick tour"] button')?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [close, open]);

  if (!open || !step || typeof document === "undefined") return null;

  const w = 320;
  const h = 170;
  const pad = 10;
  const gap = 14;
  let left = window.innerWidth / 2 - w / 2;
  let top = window.innerHeight / 2 - h / 2;

  if (rect) {
    const place = step.placement || "bottom";
    if (place === "bottom") {
      left = rect.left + rect.width / 2 - w / 2;
      top = rect.bottom + gap;
    } else if (place === "top") {
      left = rect.left + rect.width / 2 - w / 2;
      top = rect.top - gap - h;
    } else if (place === "right") {
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - h / 2;
    } else if (place === "left") {
      left = rect.left - gap - w;
      top = rect.top + rect.height / 2 - h / 2;
    }
  }

  left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
  top = Math.max(12, Math.min(top, window.innerHeight - h - 12));

  return createPortal(
    <div className="fixed inset-0 z-[500]" role="dialog" aria-modal="true" aria-label="CarryGo quick tour">
      <div className="absolute inset-0 bg-[rgba(11,13,12,.42)]" onClick={() => close(false)} />
      {rect ? (
        <motion.div
          initial={false}
          animate={{
            left: rect.left - pad,
            top: rect.top - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 32 }
          }
          className="pointer-events-none absolute rounded-2xl shadow-[0_0_0_9999px_rgba(11,13,12,.42)] ring-1 ring-white/60"
        />
      ) : null}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, left, top }}
        role="document" tabIndex={-1} className="absolute w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{step.title}</h3>
          <button type="button" className="text-[var(--muted)]" onClick={() => close(false)} aria-label="Close tour">
            ×
          </button>
        </div>
        <div className="mt-2 text-sm text-[var(--muted)]">{step.content}</div>
        <div className="mt-4 flex items-center justify-between">
          <span className="min-h-11 flex items-center text-[9px] font-bold text-[var(--muted)]">
            {index + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn ghost min-h-11" onClick={() => (index ? setIndex(index - 1) : close(false))}>
              {index ? "Back" : "Skip"}
            </button>
            <button type="button" className="btn dark min-h-11" onClick={() => (index === steps.length - 1 ? close(true) : setIndex(index + 1))}>
              {index === steps.length - 1 ? "Done" : "Next"} →
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

export function useTour(key: string) {
  const [open, setOpen] = React.useState(false);
  const start = React.useCallback(() => setOpen(true), []);
  const seen = React.useCallback(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  }, [key]);
  const markSeen = React.useCallback(() => {
    try {
      localStorage.setItem(key, "1");
    } catch {}
  }, [key]);
  return { open, setOpen, start, seen, markSeen };
}
