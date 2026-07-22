"use client";

import { useEffect } from "react";
import { GlassCard } from "../GlassCard";
import { MinsiButton } from "../MinsiButton";
import type { QRProvider } from "../../../lib/auth/login-api";
import { useOAuthQrImage } from "./useOAuthQrImage";
import { useQRLoginPolling, type QRLoginCardStatus } from "./useQRLoginPolling";

export interface QRLoginCardProps {
  provider: QRProvider;
  active: boolean;
  onActivate: (provider: QRProvider) => void;
  onSuccess?: () => void;
  onStateChange?: (state: QRLoginCardSnapshot) => void;
}

export interface QRLoginCardSnapshot {
  provider: QRProvider;
  status: QRLoginCardStatus;
  remainingSeconds: number;
  errorMessage: string | null;
  refresh: () => void;
}

const providerCopy: Record<QRProvider, { title: string; instruction: string; iconClassName: string }> = {
  wechat: {
    title: "微信扫码登录",
    instruction: "请使用微信扫一扫",
    iconClassName: "text-[var(--minsi-wechat)]"
  },
  qq: {
    title: "QQ 扫码登录",
    instruction: "请使用 QQ 扫一扫",
    iconClassName: "text-[var(--minsi-qq)]"
  }
};

function ProviderIcon({ provider, className = "" }: { provider: QRProvider; className?: string }) {
  if (provider === "wechat") {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M13.5 6.4c-5.3 0-9.6 3.4-9.6 7.6 0 2.4 1.4 4.5 3.6 5.9l-.8 2.9 3.2-1.7c1.1.3 2.3.5 3.6.5 5.3 0 9.6-3.4 9.6-7.6s-4.3-7.6-9.6-7.6Z" fill="currentColor" opacity="0.9" />
        <path d="M21.8 13.8c-4.2 0-7.6 2.7-7.6 6s3.4 6 7.6 6c1 0 1.9-.2 2.8-.5l2.5 1.4-.6-2.4c1.7-1.1 2.9-2.7 2.9-4.5 0-3.3-3.4-6-7.6-6Z" fill="currentColor" />
        <circle cx="10.3" cy="12.8" r="1.1" fill="white" />
        <circle cx="16.2" cy="12.8" r="1.1" fill="white" />
        <circle cx="19.6" cy="18.7" r="0.9" fill="white" />
        <circle cx="24.4" cy="18.7" r="0.9" fill="white" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 3.5c-4.2 0-7.1 3.6-7.1 8.2 0 2-.5 3.8-1.4 5.6-1 2.1-.5 4.2 1.1 4.8.3 3.5 3 6.2 7.4 6.2s7.1-2.7 7.4-6.2c1.6-.6 2.1-2.7 1.1-4.8-.9-1.8-1.4-3.6-1.4-5.6 0-4.6-2.9-8.2-7.1-8.2Z" fill="currentColor" />
      <ellipse cx="12.9" cy="11.2" rx="1.15" ry="1.75" fill="white" />
      <ellipse cx="19.1" cy="11.2" rx="1.15" ry="1.75" fill="white" />
      <path d="M12 18.4c1.1 1.3 2.4 2 4 2s2.9-.7 4-2c-1 .5-2.3.8-4 .8s-3-.3-4-.8Z" fill="white" />
    </svg>
  );
}

export function QRLoginCard({ provider, active, onActivate, onSuccess, onStateChange }: QRLoginCardProps) {
  const copy = providerCopy[provider];
  const { status, authorizeUrl, qrUrl, remainingSeconds, errorMessage, refresh } = useQRLoginPolling({ provider, active, onSuccess });
  const { imageUrl: qrImageUrl, error: qrImageError } = useOAuthQrImage(qrUrl ?? authorizeUrl);
  const needsRefresh = active && (status === "expired" || status === "error" || qrImageError);

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
    <GlassCard
      as="article"
      className={`min-w-0 rounded-[18px] border bg-[var(--minsi-card-bg-strong)] px-4 pb-4 pt-3 transition duration-200 sm:px-[28px] lg:h-[247px] lg:w-[260px] ${
        active ? "border-[var(--minsi-border)] shadow-[var(--shadow-floating)]" : "border-[var(--minsi-border-soft)]"
      }`}
    >
      <MinsiButton
        type="button"
        onClick={() => onActivate(provider)}
        aria-pressed={active}
        className={`mx-auto flex h-8 w-full items-center justify-center gap-2 rounded-full px-2 text-[14px] font-medium transition ${
          active ? "text-[var(--minsi-ink)]" : "text-[var(--minsi-copy-strong)]"
        }`}
      >
        <ProviderIcon provider={provider} className={`h-[25px] w-[25px] shrink-0 ${copy.iconClassName}`} />
        <span>{copy.title}</span>
      </MinsiButton>

      <div className="mt-2 flex flex-col items-center">
        <div className="relative flex aspect-square w-full max-w-[160px] items-center justify-center rounded-[18px] bg-[var(--minsi-white)] p-2 shadow-[var(--shadow-floating)]">
          {qrImageUrl ? (
            <img className="h-[88%] w-[88%] rounded-[14px] object-contain" src={qrImageUrl} alt={`${copy.title}二维码`} draggable={false} />
          ) : needsRefresh ? null : (
            <span className="text-center text-[13px] leading-5 text-[var(--minsi-muted)]">正在生成二维码</span>
          )}

          {active && status === "loading" ? (
            <div className="absolute inset-3 flex flex-col items-center justify-center rounded-[16px] bg-[var(--minsi-white)] text-center text-[13px] leading-5 text-[var(--minsi-muted)]">
              <span className="mb-3 h-7 w-7 rounded-full border-2 border-[var(--minsi-lavender)] border-t-[var(--minsi-primary)] motion-safe:animate-spin" aria-hidden="true" />
              <span>正在加载</span>
            </div>
          ) : null}

          {status === "scanned" || status === "success" ? (
            <div className="absolute left-1/2 top-1/2 flex min-w-[112px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--minsi-border-soft)] bg-[color-mix(in_srgb,var(--minsi-white)_94%,transparent)] px-3 py-2 text-center text-[12px] font-medium leading-4 text-[var(--minsi-primary)] shadow-[var(--shadow-language)]">
              {status === "success" ? "正在进入 Minsi" : "请在手机上确认"}
            </div>
          ) : null}

          {needsRefresh ? (
            <div className="absolute inset-3 flex flex-col items-center justify-center rounded-[16px] bg-[color-mix(in_srgb,var(--minsi-white)_92%,transparent)] px-3 text-center">
              <p className="text-[13px] leading-5 text-[var(--minsi-muted)]">{status === "expired" ? "二维码过期了" : "二维码生成失败"}</p>
              <MinsiButton
                type="button"
                onClick={refresh}
                className="mt-3 h-9 rounded-full bg-[var(--minsi-primary-soft)] px-4 text-[13px] font-medium text-[var(--minsi-white)] shadow-[var(--shadow-login)]"
              >
                刷新二维码
              </MinsiButton>
            </div>
          ) : null}
        </div>

        <p className="mt-2 text-center text-[14px] leading-5 text-[var(--minsi-muted)]">{copy.instruction}</p>
      </div>
    </GlassCard>
  );
}
