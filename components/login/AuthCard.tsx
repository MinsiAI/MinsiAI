"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GlassCard } from "../site/GlassCard";
import { SafetyNotice } from "../site/SafetyNotice";
import { requestQrCode, resolveSafeRedirectPath } from "../../lib/auth/login-api";
import type { LoginMessages } from "../../lib/i18n/messages";
import { EmailLoginForm } from "./EmailLoginForm";
import { LoginSafetyStrip } from "./LoginSafetyStrip";
import { QRLoginCard, type QRLoginCardSnapshot, type QRProvider } from "./QRLoginCard";
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

interface AuthCardProps {
  copy: LoginMessages;
}

export function AuthCard({ copy }: AuthCardProps) {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<QRProvider>("wechat");
  const [mobileLoadingProvider, setMobileLoadingProvider] = useState<QRProvider | null>(null);
  const [mobileLoginError, setMobileLoginError] = useState<string | null>(null);
  const [qrSnapshot, setQrSnapshot] = useState<QRLoginCardSnapshot | null>(null);

  const handleLoginSuccess = useCallback((oauthRedirect?: string) => {
    const redirect = resolveSafeRedirectPath(oauthRedirect ?? new URLSearchParams(window.location.search).get("redirect"));
    router.replace(redirect);
  }, [router]);

  const handleQrStateChange = useCallback((nextSnapshot: QRLoginCardSnapshot) => {
    setQrSnapshot((currentSnapshot) => {
      if (
        currentSnapshot?.provider === nextSnapshot.provider &&
        currentSnapshot.status === nextSnapshot.status &&
        currentSnapshot.remainingSeconds === nextSnapshot.remainingSeconds &&
        currentSnapshot.errorMessage === nextSnapshot.errorMessage
      ) {
        return currentSnapshot;
      }

      return nextSnapshot;
    });
  }, []);

  const handleMobileOAuthLogin = useCallback(async (provider: QRProvider) => {
    setActiveProvider(provider);
    setMobileLoadingProvider(provider);
    setMobileLoginError(null);

    try {
      const redirect = resolveSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
      const oauthStart = await requestQrCode(provider, redirect, "mobile");
      window.location.assign(oauthStart.authorizeUrl);
    } catch {
      setMobileLoadingProvider(null);
      setMobileLoginError(provider === "wechat" ? copy.mobileOauthError.wechat : copy.mobileOauthError.qq);
    }
  }, [copy.mobileOauthError.qq, copy.mobileOauthError.wechat]);

  const status = qrSnapshot?.status ?? "loading";
  const remainingSeconds = qrSnapshot?.remainingSeconds ?? 120;
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
  let qrStatusText = (
    <span>
      {copy.qrStatus.refreshPrefix} <span className="text-[var(--minsi-primary)]">{minutes}:{seconds}</span>
      {copy.qrStatus.refreshSuffix ? ` ${copy.qrStatus.refreshSuffix}` : ""}
    </span>
  );

  if (status === "loading") {
    qrStatusText = <span>{copy.qrStatus.loading}</span>;
  }
  if (status === "expired") {
    qrStatusText = <span>{copy.qrStatus.expired}</span>;
  }
  if (status === "error") {
    qrStatusText = <span>{qrSnapshot?.errorMessage ?? copy.qrStatus.errorFallback}</span>;
  }
  if (status === "success") {
    qrStatusText = <span>{copy.qrStatus.success}</span>;
  }

  return (
    <section className="login-auth-shell relative w-full max-w-[390px]">
      <CloudMascot />

      <GlassCard
        as="section"
        className="login-auth-card relative z-10 mx-auto h-full overflow-visible rounded-[34px] border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-5 pb-5 pt-[56px] text-center shadow-[var(--shadow-card)] backdrop-blur-[30px] max-md:max-w-[390px] max-md:rounded-[30px]"
      >
        <header className="mx-auto max-w-[640px]">
          <h1 className="login-auth-title text-[clamp(26px,5.9vw,38px)] font-semibold leading-tight tracking-[0] text-[var(--minsi-ink)]">
            {copy.titlePrefix} <span className="hero-minsi">Minsi</span>
            <span className="ml-2 inline-block translate-y-[-2px] text-[0.72em] font-normal text-[var(--minsi-primary)]">♡</span>
          </h1>
          <p className="login-auth-subtitle mt-2 text-[clamp(12px,3.15vw,15px)] leading-[1.55] text-[var(--minsi-muted)]">
            {copy.subtitleLines[0]}
            <br />
            {copy.subtitleLines[1]} <span className="text-[var(--minsi-primary)]">♡</span>
          </p>
        </header>

        <div className="login-qr-row mt-[18px] hidden translate-x-[6px] justify-center gap-6 lg:flex">
          <QRLoginCard provider="wechat" copy={copy.qr.providers.wechat} active={activeProvider === "wechat"} load onSelect={setActiveProvider} onSuccess={handleLoginSuccess} onStateChange={handleQrStateChange} />
          <QRLoginCard provider="qq" copy={copy.qr.providers.qq} active={activeProvider === "qq"} load onSelect={setActiveProvider} onSuccess={handleLoginSuccess} onStateChange={handleQrStateChange} />
        </div>

        <div className="login-qr-status mt-[15px] hidden items-center justify-center gap-3 text-[14px] leading-7 text-[var(--minsi-muted)] lg:flex">
          <Image className="login-status-refresh" src="/figma-assets/login-refresh.svg" alt="" width={18} height={18} draggable={false} />
          {qrStatusText}
          <Image className="login-status-info" src="/figma-assets/login-info.svg" alt="" width={14} height={14} draggable={false} />
        </div>

        <div className="login-social-stack mt-6 grid gap-3 lg:hidden">
          <SocialLoginButton
            provider="wechat"
            active={mobileLoadingProvider === "wechat"}
            loading={mobileLoadingProvider === "wechat"}
            disabled={mobileLoadingProvider !== null}
            copy={copy.social}
            onClick={() => void handleMobileOAuthLogin("wechat")}
          />
          <SocialLoginButton
            provider="qq"
            active={mobileLoadingProvider === "qq"}
            loading={mobileLoadingProvider === "qq"}
            disabled={mobileLoadingProvider !== null}
            copy={copy.social}
            onClick={() => void handleMobileOAuthLogin("qq")}
          />
        </div>

        {mobileLoginError ? (
          <p className="mt-3 text-center text-[12px] leading-5 text-[var(--minsi-danger)] lg:hidden">{mobileLoginError}</p>
        ) : null}

        <div className="login-email-divider mx-auto mt-[16px] flex w-full max-w-[510px] items-center gap-4 lg:mt-[13px]">
          <span className="h-px flex-1 bg-[var(--minsi-line)]" />
          <span className="shrink-0 text-[13px] leading-none text-[var(--minsi-muted)] md:text-[14px]">{copy.emailDivider}</span>
          <span className="h-px flex-1 bg-[var(--minsi-line)]" />
        </div>

        <EmailLoginForm copy={copy.email} />

        <LoginSafetyStrip labels={copy.safetyItems} className="mx-auto mt-5 lg:mt-[18px]" />
      </GlassCard>

      <SafetyNotice
        text={copy.safetyText}
        className="login-bottom-notice absolute left-1/2 top-[calc(100%+16px)] z-30 hidden w-[424px] -translate-x-1/2 items-center justify-center gap-[10px] whitespace-nowrap text-center text-[14px] leading-normal tracking-[0] text-[var(--minsi-muted)] lg:flex"
      />
    </section>
  );
}
