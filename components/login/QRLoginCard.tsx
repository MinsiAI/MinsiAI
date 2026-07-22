"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { QRProvider } from "../../lib/auth/login-api";
import type { LoginMessages } from "../../lib/i18n/messages";
import { useQRLoginPolling, type QRLoginCardStatus } from "../site/login/useQRLoginPolling";
import { useOAuthQrImage } from "../site/login/useOAuthQrImage";

export type { QRProvider };
export type QRStatus = QRLoginCardStatus;

export interface QRLoginCardSnapshot {
  provider: QRProvider;
  status: QRStatus;
  remainingSeconds: number;
  errorMessage: string | null;
  refresh: () => void;
}

interface QRLoginCardProps {
  provider: QRProvider;
  copy: LoginMessages["qr"]["providers"][QRProvider];
  active: boolean;
  load?: boolean;
  onSelect: (provider: QRProvider) => void;
  onSuccess?: (redirect?: string) => void;
  onStateChange?: (state: QRLoginCardSnapshot) => void;
}

const providerVisual: Record<QRProvider, { accentClass: string; iconSrc: string }> = {
  wechat: {
    accentClass: "text-[var(--minsi-wechat)]",
    iconSrc: "/figma-assets/login-wechat.svg"
  },
  qq: {
    accentClass: "text-[var(--minsi-qq)]",
    iconSrc: "/figma-assets/login-qq.svg"
  }
};

function statusText(status: QRStatus, copy: QRLoginCardProps["copy"]) {
  if (status === "loading") return copy.loading;
  if (status === "expired") return copy.expired;
  if (status === "scanned") return copy.scanned;
  if (status === "success") return copy.success;
  if (status === "error") return copy.error;
  return null;
}

export function QRLoginCard({ provider, copy, active, load, onSelect, onSuccess, onStateChange }: QRLoginCardProps) {
  const visual = providerVisual[provider];
  const shouldLoad = load ?? active;
  const { status, authorizeUrl, qrUrl, remainingSeconds, errorMessage, refresh } = useQRLoginPolling({ provider, active: shouldLoad, onSuccess });
  const { imageUrl: qrImageUrl, error: qrImageError } = useOAuthQrImage(qrUrl ?? authorizeUrl);
  const shouldShowRetry = status === "error" || status === "expired" || qrImageError;
  const overlay = shouldShowRetry || (status !== "scanned" && status !== "success") ? null : statusText(status, copy);

  useEffect(() => {
    if (!active) {
      return;
    }

    onStateChange?.({
      provider,
      status,
      remainingSeconds,
      errorMessage,
      refresh
    });
  }, [active, errorMessage, onStateChange, provider, refresh, remainingSeconds, status]);

  return (
    <article
      className={`login-qr-card login-qr-card-${provider} relative flex h-[256px] w-[243px] shrink-0 flex-col items-center rounded-[21px] border border-[var(--minsi-border)] bg-[var(--minsi-white)] px-[42px] py-[14px] text-center transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${
        active ? "shadow-[var(--shadow-login)]" : ""
      }`}
      data-active={active}
    >
      <button
        type="button"
        onClick={() => onSelect(provider)}
        className={`login-qr-card-title flex items-center justify-center gap-2 text-[14px] leading-7 ${visual.accentClass}`}
        aria-pressed={active}
      >
        <Image className={`login-provider-icon login-provider-icon-${provider}`} src={visual.iconSrc} alt="" width={26} height={26} draggable={false} />
        <span>{copy.title}</span>
      </button>

      <div className={`login-qr-box login-qr-box-${provider} relative mt-[10px] flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-[16px] bg-[var(--minsi-white)]`}>
        {qrImageUrl ? (
          <img className="login-oauth-qr-image h-[88%] w-[88%] object-contain" src={qrImageUrl} alt={copy.alt} draggable={false} />
        ) : shouldShowRetry ? null : (
          <span className="px-2 text-center text-[12px] leading-5 text-[var(--minsi-muted)]">{copy.loading}</span>
        )}
        {shouldShowRetry ? (
          <button
            type="button"
            onClick={refresh}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[16px] bg-[color-mix(in_srgb,var(--minsi-white)_94%,transparent)] px-3 text-[13px] leading-5 text-[var(--minsi-muted)]"
          >
            <span>{status === "expired" ? copy.expired : copy.failed}</span>
            <span className="mt-2 rounded-full bg-[var(--minsi-primary-soft)] px-4 py-1.5 text-[12px] font-medium text-[var(--minsi-white)]">
              {copy.retry}
            </span>
          </button>
        ) : null}
        {overlay ? (
          <span className="absolute inset-x-3 top-1/2 flex min-h-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-3 text-[12px] leading-none text-[var(--minsi-copy-strong)] shadow-[var(--shadow-language)] backdrop-blur-[10px]">
            {overlay}
          </span>
        ) : null}
      </div>

      <p className="login-qr-hint mt-[3px] text-[14px] leading-7 text-[var(--minsi-muted)]">{copy.hint}</p>
    </article>
  );
}
