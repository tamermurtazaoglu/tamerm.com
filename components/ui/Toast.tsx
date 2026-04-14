"use client";

import { useEffect, useState } from "react";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

/** Ephemeral toast notification that auto-dismisses after 3.8 s */
export default function Toast({ message, visible, onHide }: Props) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!visible) { setHiding(false); return; }

    const hideTimer = setTimeout(() => {
      setHiding(true);
    }, 3800);

    return () => clearTimeout(hideTimer);
  }, [visible]);

  useEffect(() => {
    if (!hiding) return;
    const cleanup = setTimeout(() => {
      setHiding(false);
      onHide();
    }, 400);
    return () => clearTimeout(cleanup);
  }, [hiding, onHide]);

  if (!visible && !hiding) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
                  px-5 py-3 rounded-xl text-sm font-medium text-[var(--text)]
                  bg-[rgba(15,18,35,0.92)] border border-white/[0.1]
                  backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                  transition-[opacity,transform] duration-[350ms]
                  ${hiding ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
    >
      {message}
    </div>
  );
}
