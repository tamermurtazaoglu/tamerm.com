"use client";

import { useEffect, useRef } from "react";

export interface MousePosition {
  x: number;
  y: number;
  down: boolean;
}

/**
 * Returns a ref to the latest mouse position.
 * Using a ref (not state) avoids re-renders on every mousemove.
 */
export function useMousePosition(): React.RefObject<MousePosition> {
  const mouse = useRef<MousePosition>({ x: -9999, y: -9999, down: false });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onDown = () => { mouse.current.down = true; };
    const onUp = () => { mouse.current.down = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return mouse;
}
