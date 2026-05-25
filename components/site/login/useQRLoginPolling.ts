"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pollQrLoginStatus, requestQrCode, type QRProvider } from "../../../lib/auth/login-api";
import { useCountdown } from "./useCountdown";

export type QRLoginCardStatus = "idle" | "loading" | "active" | "expired" | "scanned" | "success" | "error";

interface UseQRLoginPollingOptions {
  provider: QRProvider;
  active: boolean;
  onSuccess?: () => void;
}

export function useQRLoginPolling({ provider, active, onSuccess }: UseQRLoginPollingOptions) {
  const [status, setStatus] = useState<QRLoginCardStatus>("idle");
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const qrIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const requestVersionRef = useRef(0);
  const { remainingSeconds, start, stop, reset } = useCountdown();

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const loadQrCode = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    clearPollTimer();
    reset();
    qrIdRef.current = null;
    setQrImageUrl(null);
    setErrorMessage(null);
    setStatus("loading");

    try {
      const qrCode = await requestQrCode(provider);

      if (requestVersionRef.current !== requestVersion || !active) {
        return;
      }

      qrIdRef.current = qrCode.qrId;
      setQrImageUrl(qrCode.qrImageUrl);
      setStatus("active");
      start(qrCode.expiresInSeconds);

      pollTimerRef.current = window.setInterval(async () => {
        const qrId = qrIdRef.current;

        if (!qrId) {
          return;
        }

        try {
          const result = await pollQrLoginStatus(provider, qrId);

          if (requestVersionRef.current !== requestVersion) {
            return;
          }

          if (result.status === "scanned") {
            setStatus("scanned");
            return;
          }

          if (result.status === "confirmed") {
            setStatus("success");
            clearPollTimer();
            stop();
            onSuccess?.();
            return;
          }

          if (result.status === "expired") {
            setStatus("expired");
            clearPollTimer();
            stop();
            return;
          }

          if (result.status === "error") {
            setStatus("error");
            setErrorMessage("二维码加载有点慢，我们再试一次。");
            clearPollTimer();
            stop();
          }
        } catch {
          setStatus("error");
          setErrorMessage("网络好像有点慢，我们再试一次。");
          clearPollTimer();
          stop();
        }
      }, 2500);
    } catch {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setStatus("error");
      setErrorMessage("二维码加载有点慢，我们再试一次。");
      clearPollTimer();
      stop();
    }
  }, [active, clearPollTimer, onSuccess, provider, reset, start, stop]);

  useEffect(() => {
    if (!active) {
      requestVersionRef.current += 1;
      clearPollTimer();
      reset();
      qrIdRef.current = null;
      setQrImageUrl(null);
      setErrorMessage(null);
      setStatus("idle");
      return;
    }

    void loadQrCode();

    return () => {
      requestVersionRef.current += 1;
      clearPollTimer();
      stop();
    };
  }, [active, clearPollTimer, loadQrCode, reset, stop]);

  useEffect(() => {
    if (!active || remainingSeconds > 0) {
      return;
    }

    if (status === "active" || status === "scanned") {
      setStatus("expired");
      clearPollTimer();
      stop();
    }
  }, [active, clearPollTimer, remainingSeconds, status, stop]);

  const refresh = useCallback(() => {
    if (!active || status === "loading") {
      return;
    }

    void loadQrCode();
  }, [active, loadQrCode, status]);

  return {
    status,
    qrImageUrl,
    remainingSeconds,
    errorMessage,
    refresh
  };
}
