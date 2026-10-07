"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface EyeProps {
  mouseX: number;
  mouseY: number;
  selfRef: React.RefObject<HTMLDivElement | null>;
  otherRef: React.RefObject<HTMLDivElement | null>;
}

const Eye: React.FC<EyeProps> = ({ mouseX, mouseY, selfRef, otherRef }) => {
  const pupilRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const updateCenter = React.useCallback(() => {
    if (!selfRef.current) return;
    const rect = selfRef.current.getBoundingClientRect();
    setCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }, [selfRef]);

  useEffect(() => {
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, [updateCenter]);

  useEffect(() => {
    const isInside = (ref: React.RefObject<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return false;
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    };

    if (isInside(selfRef) || isInside(otherRef)) return;

    const dx = mouseX - center.x;
    const dy = mouseY - center.y;
    const angle = Math.atan2(dy, dx);
    const maxMove = 20;

    if (pupilRef.current) {
      pupilRef.current.style.transform = `translate(${Math.cos(angle) * maxMove}px, ${Math.sin(angle) * maxMove}px)`;
    }
  }, [mouseX, mouseY, center, otherRef, selfRef]);

  return (
    <div
      ref={selfRef}
      aria-hidden="true"
      className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white shadow-sm"
    >
      <div
        ref={pupilRef}
        className="absolute h-8 w-8 rounded-full bg-black transition-transform duration-[5ms] will-change-transform"
      >
        <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-white" />
      </div>
    </div>
  );
};

interface MouseFollowingEyesProps {
  className?: string;
}

const MouseFollowingEyes: React.FC<MouseFollowingEyesProps> = ({ className = "" }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eye1Ref = useRef<HTMLDivElement>(null);
  const eye2Ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={`flex items-center justify-center rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      <div className="flex -space-x-2">
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye1Ref}
          otherRef={eye2Ref}
        />
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye2Ref}
          otherRef={eye1Ref}
        />
      </div>
    </div>
  );
};

export { MouseFollowingEyes };
