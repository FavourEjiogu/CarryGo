"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface EyeProps {
  mouseX: number;
  mouseY: number;
  selfRef: React.RefObject<HTMLDivElement | null>;
  otherRef: React.RefObject<HTMLDivElement | null>;
  closed: boolean;
}

function Eye({ mouseX, mouseY, selfRef, otherRef, closed }: EyeProps) {
  const pupilRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const updateCenter = React.useCallback(() => {
    const element = selfRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [selfRef]);

  useEffect(() => {
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, [updateCenter]);

  useEffect(() => {
    if (closed || !pupilRef.current) return;

    const containsPointer = (ref: React.RefObject<HTMLDivElement | null>) => {
      const rect = ref.current?.getBoundingClientRect();
      return Boolean(
        rect &&
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom,
      );
    };

    if (containsPointer(selfRef) || containsPointer(otherRef)) return;

    const angle = Math.atan2(mouseY - center.y, mouseX - center.x);
    const maxMove = 20;
    pupilRef.current.style.transform =
      "translate(" +
      Math.cos(angle) * maxMove +
      "px," +
      Math.sin(angle) * maxMove +
      "px)";
  }, [closed, mouseX, mouseY, center, selfRef, otherRef]);

  return (
    <div
      ref={selfRef}
      className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white shadow-sm"
      aria-hidden="true"
    >
      <div
        ref={pupilRef}
        className="absolute h-8 w-8 rounded-full bg-black transition-[opacity,transform] duration-100"
        style={{ opacity: closed ? 0 : 1 }}
      >
        <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-white" />
      </div>
      {closed ? (
        <span className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 rotate-[-8deg] rounded-full bg-black" />
      ) : null}
    </div>
  );
}

interface MouseFollowingEyesProps {
  className?: string;
  closed?: boolean;
}

export function MouseFollowingEyes({
  className = "",
  closed = false,
}: MouseFollowingEyesProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eye1Ref = useRef<HTMLDivElement>(null);
  const eye2Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={"desktop-eyes-only flex items-center justify-center rounded-xl " + className}
      onMouseMove={(event) =>
        setMousePos({ x: event.clientX, y: event.clientY })
      }
      aria-hidden="true"
    >
      <div className="flex -space-x-2">
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye1Ref}
          otherRef={eye2Ref}
          closed={closed}
        />
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye2Ref}
          otherRef={eye1Ref}
          closed={closed}
        />
      </div>
    </div>
  );
}
