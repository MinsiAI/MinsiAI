"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "../GlassCard";
import { SafetyNotice } from "../SafetyNotice";
import { SiteHeader } from "../SiteHeader";
import type { QRProvider } from "../../../lib/auth/login-api";
import { EmailCodeLoginForm } from "./EmailCodeLoginForm";
import { LoginPrivacyBar } from "./LoginPrivacyBar";
import { QRLoginCard, type QRLoginCardSnapshot } from "./QRLoginCard";

const asset = (name: string) => `/figma-assets/${name}`;

function LoginTitle() {
  return (
    <div className="text-center">
      <h1 className="text-[30px] font-bold leading-tight tracking-normal text-[var(--minsi-ink)] sm:text-[34px] lg:text-[38px]">
        嗨，欢迎来到{" "}
        <span className="bg-[linear-gradient(180deg,var(--minsi-hero-purple-start)_0%,var(--minsi-hero-purple-mid)_68%,var(--minsi-hero-purple-end)_100%)] bg-clip-text text-transparent">
          Minsi
        </span>
        <img className="ml-2 inline h-[23px] w-[23px] align-[-2px] sm:h-[26px] sm:w-[26px]" src={asset("sparkle.svg")} alt="" draggable={false} />
      </h1>
      <p className="mx-auto mt-2 max-w-[320px] text-[15px] leading-6 text-[var(--minsi-muted)] sm:text-[16px]">
        不用真实姓名，也不用手机号
        <br />
        一句话，就可以开始
      </p>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--minsi-bg)_0%,var(--minsi-bg-soft)_46%,var(--minsi-mobile-bg-end)_100%)]" />
      <img className="absolute bottom-0 right-0 hidden h-full w-[42%] object-cover object-right-bottom opacity-90 lg:block" src={asset("bg-pc.png")} alt="" draggable={false} />
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(var(--minsi-bg-rgb),0.02)_0%,rgba(var(--minsi-bg-rgb),0.08)_52%,rgba(var(--minsi-bg-rgb),0.56)_72%,rgba(var(--minsi-bg-rgb),0.22)_100%)] lg:block" />
      <div className="absolute -left-[9vw] top-[18%] hidden aspect-square w-[22vw] rounded-full bg-[radial-gradient(circle_at_36%_34%,var(--minsi-white)_0%,var(--minsi-voice-mobile-start)_18%,var(--minsi-voice-mobile-mid)_58%,var(--minsi-voice-mobile-end)_100%)] opacity-[0.42] blur-[0.2px] lg:block" />
      <div className="absolute -left-[11vw] top-[36%] hidden h-[1.9vw] w-[27vw] -rotate-[14deg] rounded-full border-[0.24vw] border-[var(--minsi-white)] opacity-55 lg:block" />
      <img className="absolute -left-24 bottom-[-46px] h-[230px] w-[310px] object-contain opacity-70 sm:left-[-64px] sm:h-[280px] sm:w-[360px] lg:left-[-3%] lg:bottom-[-10%] lg:h-[15vw] lg:w-[22vw] lg:opacity-55" src={asset("cloud.png")} alt="" draggable={false} />
      <span className="absolute left-[18%] top-[14%] hidden h-6 w-6 rotate-45 rounded-[4px] bg-[var(--minsi-white)] opacity-90 lg:block" />
      <span className="absolute left-[37%] top-[4.5%] hidden h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[var(--minsi-white)] opacity-80 lg:block" />
      <span className="absolute left-[58%] top-[5%] hidden h-3.5 w-3.5 rotate-45 rounded-[3px] bg-[var(--minsi-white)] opacity-86 lg:block" />
    </div>
  );
}

function TopCloudMascot() {
  return (
    <img
      className="pointer-events-none absolute left-1/2 top-[-36px] h-[74px] w-[116px] -translate-x-1/2 object-contain drop-shadow-sm lg:top-[-44px] lg:h-[92px] lg:w-[138px]"
      src={asset("cloud.png")}
      alt=""
      draggable={false}
      aria-hidden="true"
    />
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12a8 8 0 0 1-13.5 5.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M4 12A8 8 0 0 1 17.5 6.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M6.5 18H3.5v-3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 6H20.5v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.8v5.4M12 7.7h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function formatQrTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const restSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${restSeconds}`;
}

function QRStatusLine({ snapshot }: { snapshot: QRLoginCardSnapshot | null }) {
  const status = snapshot?.status ?? "loading";
  const remainingSeconds = snapshot?.remainingSeconds ?? 120;

  let statusText = (
    <>
      二维码 <strong className="font-semibold text-[var(--minsi-primary)]">{formatQrTime(remainingSeconds)}</strong> 后自动刷新
    </>
  );

  if (status === "loading") {
    statusText = <>二维码正在生成</>;
  }

  if (status === "scanned") {
    statusText = <>已扫码，请在手机上确认</>;
  }

  if (status === "expired") {
    statusText = <>二维码已过期，点击卡片内按钮刷新</>;
  }

  if (status === "error") {
    statusText = <>{snapshot?.errorMessage ?? "二维码加载有点慢，我们再试一次。"}</>;
  }

  return (
    <div className="mt-3 flex min-h-[26px] items-center justify-center gap-3 text-center text-[14px] leading-6 text-[var(--minsi-muted)]">
      <RefreshIcon className="h-[18px] w-[18px] shrink-0 text-[var(--minsi-muted)]" />
      <span>{statusText}</span>
      <InfoIcon className="h-[15px] w-[15px] shrink-0 text-[var(--minsi-muted)]" />
    </div>
  );
}

function DividerLabel() {
  return (
    <div className="mx-auto mt-1 flex w-full max-w-[492px] items-center gap-4 text-[14px] leading-6 text-[var(--minsi-muted)]">
      <span className="h-px flex-1 bg-[var(--minsi-border)]" />
      <span className="shrink-0">或使用邮箱登录</span>
      <span className="h-px flex-1 bg-[var(--minsi-border)]" />
    </div>
  );
}

export function LoginShell() {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<QRProvider>("wechat");
  const [qrSnapshot, setQrSnapshot] = useState<QRLoginCardSnapshot | null>(null);

  const handleLoginSuccess = useCallback(() => {
    router.push("/chat");
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

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,var(--minsi-bg)_0%,var(--minsi-bg-soft)_45%,var(--minsi-mobile-bg-end)_100%)] px-[var(--space-mobile-x)] pb-[max(18px,env(safe-area-inset-bottom))] pt-0 lg:px-0">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col">
        <SiteHeader
          variant="mobile"
          showNav={false}
          showLogin={false}
          logoHref="/"
        />
        <SiteHeader
          variant="desktop"
          showNav={false}
          showLogin={false}
          logoHref="/"
          logoSize="lg"
          className="relative z-20 hidden h-[64px] lg:block"
        />

        <div className="flex flex-1 flex-col items-center justify-start pb-7 pt-7 lg:justify-center lg:pb-8 lg:pt-0">
          <div className="w-full max-w-[520px] lg:max-w-[790px]">
            <GlassCard
              as="section"
              className="relative w-full rounded-[32px] border border-[var(--minsi-white)] bg-[var(--minsi-card-bg)] px-4 pb-5 pt-9 shadow-[var(--shadow-card)] backdrop-blur-[20px] sm:px-7 sm:pb-6 sm:pt-11 lg:rounded-[50px] lg:px-[70px] lg:pb-[28px] lg:pt-[58px]"
            >
              <TopCloudMascot />
              <LoginTitle />

              <div className="mx-auto mt-[24px] grid w-full max-w-[548px] gap-3 sm:grid-cols-2 sm:gap-7">
                <QRLoginCard provider="wechat" active={activeProvider === "wechat"} onActivate={setActiveProvider} onSuccess={handleLoginSuccess} onStateChange={handleQrStateChange} />
                <QRLoginCard provider="qq" active={activeProvider === "qq"} onActivate={setActiveProvider} onSuccess={handleLoginSuccess} onStateChange={handleQrStateChange} />
              </div>

              <QRStatusLine snapshot={qrSnapshot} />
              <DividerLabel />

              <EmailCodeLoginForm />

              <LoginPrivacyBar />
            </GlassCard>

            <SafetyNotice
              variant="mobile"
              text="登录只是为了安全进入，Minsi 不会保存你的聊天内容。"
              className="mx-auto mt-3 flex max-w-[560px] items-start justify-center gap-1.5 text-center text-[13px] leading-5 text-[var(--minsi-muted)]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
