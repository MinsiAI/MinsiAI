"use client";

import Image from "next/image";
import { MinsiButton } from "../site/MinsiButton";
import type { QRProvider } from "./QRLoginCard";

interface SocialLoginButtonProps {
  provider: QRProvider;
  active?: boolean;
  onClick: () => void;
}

const socialCopy: Record<QRProvider, { label: string; colorClass: string; iconSrc: string }> = {
  wechat: {
    label: "微信登录",
    colorClass: "text-[var(--minsi-wechat)]",
    iconSrc: "/figma-assets/login-wechat.svg"
  },
  qq: {
    label: "QQ登录",
    colorClass: "text-[var(--minsi-qq)]",
    iconSrc: "/figma-assets/login-qq.svg"
  }
};

export function SocialLoginButton({ provider, active = false, onClick }: SocialLoginButtonProps) {
  const copy = socialCopy[provider];

  return (
    <MinsiButton
      type="button"
      onClick={onClick}
      className={`login-social-button flex min-h-[52px] w-full items-center justify-between rounded-full border bg-[var(--minsi-card-bg-strong)] px-5 text-left shadow-[var(--shadow-language)] transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${
        active ? "border-[var(--minsi-primary)]" : "border-[var(--minsi-border)]"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className={copy.colorClass}>
          <Image className={`login-social-icon login-social-icon-${provider}`} src={copy.iconSrc} alt="" width={26} height={26} draggable={false} />
        </span>
        <span className="block text-[15px] font-medium leading-none text-[var(--minsi-ink)]">{copy.label}</span>
      </span>
      <span className="text-[18px] leading-none text-[var(--minsi-primary)]">›</span>
    </MinsiButton>
  );
}
