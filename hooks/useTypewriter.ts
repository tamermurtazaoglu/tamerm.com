"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cycles through an array of strings with a typewriter effect.
 * Typing and deleting speeds are configurable.
 *
 * @param roles     - Array of strings to cycle through.
 * @param typeSpeed - Milliseconds per character while typing. Default 76.
 * @param delSpeed  - Milliseconds per character while deleting. Default 38.
 * @param pauseMs   - Pause at full string before deleting. Default 1950.
 * @param startDelay - Initial delay before starting. Default 1550.
 */
export function useTypewriter(
  roles: string[],
  typeSpeed = 76,
  delSpeed = 38,
  pauseMs = 1950,
  startDelay = 1550
): string {
  const [display, setDisplay] = useState("");
  const state = useRef({ ri: 0, ci: 0, del: false, started: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rolesRef = useRef(roles);

  // Keep rolesRef in sync without restarting the effect
  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

  useEffect(() => {
    if (!roles.length) return;

    const tick = () => {
      const { ri, ci, del } = state.current;
      const cur = rolesRef.current[ri % rolesRef.current.length];

      if (!del) {
        const next = ci + 1;
        setDisplay(cur.slice(0, next));
        state.current.ci = next;

        if (next === cur.length) {
          state.current.del = true;
          timerRef.current = setTimeout(tick, pauseMs);
        } else {
          timerRef.current = setTimeout(tick, typeSpeed);
        }
      } else {
        const next = ci - 1;
        setDisplay(cur.slice(0, next));
        state.current.ci = next;

        if (next === 0) {
          state.current.del = false;
          state.current.ri = (ri + 1) % rolesRef.current.length;
        }
        timerRef.current = setTimeout(tick, delSpeed);
      }
    };

    const startTimer = setTimeout(() => {
      state.current.started = true;
      tick();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return display;
}
