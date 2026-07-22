"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiOrigin, setRuntimeApiBaseUrl } from "../../../lib/api/http";
import { getCurrentUser, notifyAuthSessionChanged } from "../../../lib/auth/session-api";
import { checkOAuthLoginStatus, completeOAuthLogin, requestQrCode, resolveSafeRedirectPath, type QRProvider } from "../../../lib/auth/login-api";
import { useCountdown } from "./useCountdown";

export type QRLoginCardStatus = "idle" | "loading" | "active" | "expired" | "scanned" | "success" | "error";

const QQ_REFRESH_SECONDS = 30;
const OAUTH_STATUS_POLL_MS = 2000;

interface UseQRLoginPollingOptions {
  provider: QRProvider;
  active: boolean;
  onSuccess?: (redirect?: string) => void;
}

export function useQRLoginPolling({ provider, active, onSuccess }: UseQRLoginPollingOptions) {
  const [status, setStatus] = useState<QRLoginCardStatus>("idle");
  const [authorizeUrl, setAuthorizeUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [oauthState, setOauthState] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const isCompletingRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const { remainingSeconds, start, stop, reset } = useCountdown();

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const loadQrCode = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    reset();
    isCompletingRef.current = false;
    setAuthorizeUrl(null);
    setQrUrl(null);
    setOauthState(null);
    setErrorMessage(null);
    setStatus("loading");

    try {
      const redirect = resolveSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
      const qrCode = await requestQrCode(provider, redirect);

      if (requestVersionRef.current !== requestVersion || !active) {
        return;
      }

      setAuthorizeUrl(qrCode.authorizeUrl);
      setQrUrl(qrCode.qrUrl || qrCode.authorizeUrl);
      setOauthState(qrCode.state || extractOAuthState(qrCode.authorizeUrl));
      setStatus("active");
      start(provider === "qq" ? Math.min(qrCode.expiresInSeconds, QQ_REFRESH_SECONDS) : qrCode.expiresInSeconds);
    } catch {
      if (requestVersionRef.current !== requestVersion) {
        return;
      }

      setStatus("error");
      setErrorMessage("二维码加载有点慢，我们再试一次。");
      stop();
    }
  }, [active, provider, reset, start, stop]);

  useEffect(() => {
    if (!active) {
      requestVersionRef.current += 1;
      reset();
      setAuthorizeUrl(null);
      setQrUrl(null);
      setOauthState(null);
      setErrorMessage(null);
      setStatus("idle");
      return;
    }

    void loadQrCode();

    return () => {
      requestVersionRef.current += 1;
      stop();
    };
  }, [active, loadQrCode, reset, stop]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const apiOrigin = getApiOrigin();
    const allowedOrigins = getAllowedOAuthMessageOrigins(apiOrigin, authorizeUrl);

    const handleMessage = (event: MessageEvent) => {
      if (!allowedOrigins.has(event.origin)) {
        return;
      }

      if (!isOAuthSuccessMessage(event.data) || event.data.provider !== provider) {
        if (!isOAuthCallbackMessage(event.data) || event.data.provider !== provider || isCompletingRef.current) {
          return;
        }

        isCompletingRef.current = true;
        setStatus("scanned");
        void completeOAuthLogin(provider, event.data.code, event.data.state)
          .then((completeResult) => getCurrentUser().then((currentUser) => ({ completeResult, currentUser })))
          .then(({ completeResult, currentUser }) => {
            if (!currentUser.authenticated) {
              isCompletingRef.current = false;
              setStatus("error");
              setErrorMessage("登录状态没有生效，请刷新二维码后再试。");
              stop();
              return;
            }

            setStatus("success");
            stop();
            notifyAuthSessionChanged();
            onSuccessRef.current?.(completeResult.redirect);
          })
          .catch(() => {
            isCompletingRef.current = false;
            setStatus("error");
            setErrorMessage("登录状态没有生效，请刷新二维码后再试。");
            stop();
          });
        return;
      }

      setStatus("scanned");
      setRuntimeApiBaseUrl(event.origin);
      void getCurrentUser()
        .then((currentUser) => {
          if (!currentUser.authenticated) {
            setStatus("error");
            setErrorMessage("登录状态没有生效，请刷新二维码后再试。");
            stop();
            return;
          }

          setStatus("success");
          stop();
          notifyAuthSessionChanged();
          onSuccessRef.current?.(event.data.redirect);
        })
        .catch(() => {
          setStatus("error");
          setErrorMessage("登录状态没有生效，请刷新二维码后再试。");
          stop();
        });
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [active, authorizeUrl, provider, stop]);

  useEffect(() => {
    if (!active || !oauthState || (status !== "active" && status !== "scanned")) {
      return undefined;
    }

    let cancelled = false;
    let isPolling = false;

    const pollStatus = () => {
      if (isPolling || isCompletingRef.current) {
        return;
      }

      isPolling = true;
      void checkOAuthLoginStatus(provider, oauthState)
        .then((result) => {
          if (cancelled || result.status !== "success") {
            return;
          }

          setStatus("success");
          stop();
          notifyAuthSessionChanged();
          onSuccessRef.current?.(result.redirect);
        })
        .catch(() => {
          // Transient polling failures should not hide a still-scannable QR code.
        })
        .finally(() => {
          isPolling = false;
        });
    };

    const intervalId = window.setInterval(pollStatus, OAUTH_STATUS_POLL_MS);
    pollStatus();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [active, oauthState, provider, status, stop]);

  useEffect(() => {
    if (!active || remainingSeconds > 0) {
      return;
    }

    if (status === "active") {
      void loadQrCode();
      return;
    }

    if (status === "scanned") {
      setStatus("expired");
      stop();
    }
  }, [active, loadQrCode, remainingSeconds, status, stop]);

  const refresh = useCallback(() => {
    if (!active || status === "loading") {
      return;
    }

    void loadQrCode();
  }, [active, loadQrCode, status]);

  return {
    status,
    authorizeUrl,
    qrUrl,
    oauthState,
    remainingSeconds,
    errorMessage,
    refresh
  };
}

function isOAuthSuccessMessage(value: unknown): value is { type: "minsi:oauth:success"; provider: QRProvider; redirect: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;
  return message.type === "minsi:oauth:success"
    && (message.provider === "wechat" || message.provider === "qq")
    && typeof message.redirect === "string";
}

function isOAuthCallbackMessage(value: unknown): value is { type: "minsi:oauth:callback"; provider: QRProvider; code: string; state: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;
  return message.type === "minsi:oauth:callback"
    && (message.provider === "wechat" || message.provider === "qq")
    && typeof message.code === "string"
    && typeof message.state === "string";
}

function getAllowedOAuthMessageOrigins(apiOrigin: string, authorizeUrl: string | null) {
  const origins = new Set<string>();
  if (apiOrigin) {
    origins.add(apiOrigin);
  }

  const callbackOrigin = getAuthorizeCallbackOrigin(authorizeUrl);
  if (callbackOrigin) {
    origins.add(callbackOrigin);
  }

  return origins;
}

function getAuthorizeCallbackOrigin(authorizeUrl: string | null) {
  if (!authorizeUrl) {
    return "";
  }

  try {
    const callbackUrl = new URL(authorizeUrl).searchParams.get("redirect_uri");
    return callbackUrl ? new URL(callbackUrl).origin : "";
  } catch {
    return "";
  }
}

function extractOAuthState(authorizeUrl: string) {
  try {
    return new URL(authorizeUrl).searchParams.get("state");
  } catch {
    return null;
  }
}
