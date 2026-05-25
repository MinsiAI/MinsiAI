"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds = 0) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemainingSeconds(0);
  }, [stop]);

  const start = useCallback(
    (seconds: number) => {
      stop();
      setRemainingSeconds(seconds);

      if (seconds <= 0) {
        return;
      }

      setIsRunning(true);
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((current) => {
          if (current <= 1) {
            if (timerRef.current !== null) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }

            setIsRunning(false);
            return 0;
          }

          return current - 1;
        });
      }, 1000);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return {
    remainingSeconds,
    isRunning,
    start,
    stop,
    reset
  };
}
