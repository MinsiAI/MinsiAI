"use client";

import Image from "next/image";
import type { LoginMessages } from "../../lib/i18n/messages";
import { MinsiButton } from "../site/MinsiButton";
import type { QRProvider } from "./QRLoginCard";

interface SocialLoginButtonProps {
  provider: QRProvider;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  copy: LoginMessages["social"];
  onClick: () => void;
}

const socialVisual: Record<QRProvider, { colorClass: string; iconSrc: string }> = {
  wechat: {
    colorClass: "text-[var(--minsi-wechat)]",
    iconSrc: "/figma-assets/login-wechat.svg"
  },
  qq: {
    colorClass: "text-[var(--minsi-qq)]",
    iconSrc: "/figma-assets/login-qq.svg"
  }
};

export function SocialLoginButton({ provider, active = false, loading = false, disabled = false, copy, onClick }: SocialLoginButtonProps) {
  const visual = socialVisual[provider];
  const label = loading ? (provider === "wechat" ? copy.openingWechat : copy.openingQq) : copy[provider];

  return (
    <MinsiButton
      type="button"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      aria-busy={loading}
      className={`login-social-button flex min-h-[52px] w-full items-center justify-between rounded-full border bg-[var(--minsi-card-bg-strong)] px-5 text-left shadow-[var(--shadow-language)] transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${
        active ? "border-[var(--minsi-primary)]" : "border-[var(--minsi-border)]"
      } ${disabled && !loading ? "opacity-70" : ""}`}
    >
      <span className="flex items-center gap-3">
        <span className={visual.colorClass}>
          <Image className={`login-social-icon login-social-icon-${provider}`} src={visual.iconSrc} alt="" width={26} height={26} draggable={false} />
        </span>
        <span className="block text-[15px] font-medium leading-none text-[var(--minsi-ink)]">{label}</span>
      </span>
      <span className="text-[18px] leading-none text-[var(--minsi-primary)]">›</span>
    </MinsiButton>
  );
}
