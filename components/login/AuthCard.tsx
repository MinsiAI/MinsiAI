"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassCard } from "../site/GlassCard";
import { SafetyNotice } from "../site/SafetyNotice";
import { EmailLoginForm } from "./EmailLoginForm";
import { LoginSafetyStrip } from "./LoginSafetyStrip";
import { QRLoginCard, type QRProvider } from "./QRLoginCard";
import { SocialLoginButton } from "./SocialLoginButton";

function CloudMascot() {
  return (
    <div aria-hidden="true" className="login-auth-cloud absolute left-1/2 top-[-65px] z-20 h-[89px] w-[342px] -translate-x-1/2 md:left-[calc(50%-32px)] max-md:top-[-36px] max-md:h-[78px] max-md:w-[124px]">
      <Image className="h-full w-full object-contain" src="/figma-assets/login-cloud.png" alt="" width={330} height={86} priority draggable={false} />
      <span className="login-cloud-eye login-cloud-eye-left">
        <span className="login-cloud-pupil" />
        <span className="login-cloud-eyelid" />
      </span>
      <span className="login-cloud-eye login-cloud-eye-right">
        <span className="login-cloud-pupil" />
        <span className="login-cloud-eyelid" />
      </span>
    </div>
  );
}

export function AuthCard() {
  const [activeProvider, setActiveProvider] = useState<QRProvider>("wechat");
  const [mobileProvider, setMobileProvider] = useState<QRProvider | null>(null);

  return (
    <section className="login-auth-shell relative w-full max-w-[390px]">
      <CloudMascot />

      <GlassCard
        as="section"
        className="login-auth-card relative z-10 mx-auto h-full overflow-visible rounded-[34px] border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-5 pb-5 pt-[56px] text-center shadow-[var(--shadow-card)] backdrop-blur-[30px] max-md:max-w-[390px] max-md:rounded-[30px]"
      >
        <header className="mx-auto max-w-[640px]">
          <h1 className="login-auth-title text-[clamp(26px,5.9vw,38px)] font-semibold leading-tight tracking-[0] text-[var(--minsi-ink)]">
            嗨，欢迎来到 <span className="hero-minsi">Minsi</span>
            <span className="ml-2 inline-block translate-y-[-2px] text-[0.72em] font-normal text-[var(--minsi-primary)]">♡</span>
          </h1>
          <p className="login-auth-subtitle mt-2 text-[clamp(12px,3.15vw,15px)] leading-[1.55] text-[var(--minsi-muted)]">
            不用真实姓名，也不用手机号
            <br />
            一句话，就可以开始 <span className="text-[var(--minsi-primary)]">♡</span>
          </p>
        </header>

        <div className="login-qr-row mt-[18px] hidden translate-x-[6px] justify-center gap-6 lg:flex">
          <QRLoginCard provider="wechat" active={activeProvider === "wechat"} status={activeProvider === "wechat" ? "ready" : "idle"} onSelect={setActiveProvider} />
          <QRLoginCard provider="qq" active={activeProvider === "qq"} status={activeProvider === "qq" ? "ready" : "idle"} onSelect={setActiveProvider} />
        </div>

        <div className="login-qr-status mt-[15px] hidden items-center justify-center gap-3 text-[14px] leading-7 text-[var(--minsi-muted)] lg:flex">
          <Image className="login-status-refresh" src="/figma-assets/login-refresh.svg" alt="" width={18} height={18} draggable={false} />
          <span>二维码 <span className="text-[var(--minsi-primary)]">01:56</span> 后自动刷新</span>
          <Image className="login-status-info" src="/figma-assets/login-info.svg" alt="" width={14} height={14} draggable={false} />
        </div>

        <div className="login-social-stack mt-6 grid gap-3 lg:hidden">
          <SocialLoginButton provider="wechat" active={mobileProvider === "wechat"} onClick={() => setMobileProvider("wechat")} />
          <SocialLoginButton provider="qq" active={mobileProvider === "qq"} onClick={() => setMobileProvider("qq")} />
        </div>

        <div className="login-email-divider mx-auto mt-[16px] flex w-full max-w-[510px] items-center gap-4 lg:mt-[13px]">
          <span className="h-px flex-1 bg-[var(--minsi-line)]" />
          <span className="shrink-0 text-[13px] leading-none text-[var(--minsi-muted)] md:text-[14px]">或使用邮箱登录</span>
          <span className="h-px flex-1 bg-[var(--minsi-line)]" />
        </div>

        <EmailLoginForm />

        <LoginSafetyStrip className="mx-auto mt-5 lg:mt-[18px]" />
      </GlassCard>

      <SafetyNotice
        text="登录只是为了安全进入，Minsi 不会保存你的聊天内容。"
        className="login-bottom-notice absolute left-1/2 top-[calc(100%+16px)] z-30 hidden w-[424px] -translate-x-1/2 items-center justify-center gap-[10px] whitespace-nowrap text-center text-[14px] leading-normal tracking-[0] text-[var(--minsi-muted)] lg:flex"
      />
    </section>
  );
}
