import type { ReactNode } from "react";
import Image from "next/image";
import type { MinsiLang } from "../../lib/i18n/language";
import { SafetyNotice } from "./SafetyNotice";
import { SiteHeader } from "./SiteHeader";

interface BrandPageChromeProps {
  children: ReactNode;
  showNav?: boolean;
  showLogin?: boolean;
  backgroundSrc?: string;
  mobileBackgroundSrc?: string;
  safetyText?: string;
  safetyNoticeClassName?: string;
  mobileSafetyNoticeClassName?: string;
  desktopContentClassName?: string;
  mobileContentClassName?: string;
  lang?: MinsiLang;
  localized?: boolean;
  onLanguageChange?: (lang: MinsiLang) => void;
}

export function BrandPageChrome({
  children,
  showNav = false,
  showLogin = false,
  backgroundSrc = "/figma-assets/bg-pc.png",
  mobileBackgroundSrc,
  safetyText,
  safetyNoticeClassName,
  mobileSafetyNoticeClassName,
  desktopContentClassName = "",
  mobileContentClassName = "",
  lang,
  localized = false,
  onLanguageChange
}: BrandPageChromeProps) {
  return (
    <main className="relative min-h-svh overflow-x-hidden bg-[var(--minsi-bg)] text-[var(--minsi-ink)]">
      <section className="desktop-shell hidden min-h-[100svh] items-center justify-center overflow-x-hidden overflow-y-auto lg:flex">
        <div className="desktop-stage relative z-[1] aspect-video overflow-visible">
          <Image className="absolute inset-0 h-full w-full object-cover" src={backgroundSrc} alt="" fill sizes="100vw" priority draggable={false} />
          <div className="desktop-content-layer">
            <SiteHeader variant="desktop" showNav={showNav} showLogin={showLogin} logoHref="/" lang={lang} localized={localized} onLanguageChange={onLanguageChange} />
            <div className={desktopContentClassName}>{children}</div>
            {safetyText ? <SafetyNotice text={safetyText} className={safetyNoticeClassName} /> : null}
          </div>
        </div>
      </section>

      <section className="mobile-shell relative min-h-[100svh] overflow-x-hidden px-4 pb-2 pt-0 sm:px-8 lg:hidden">
        <Image className="absolute inset-0 h-full w-full object-cover opacity-80" src={mobileBackgroundSrc ?? backgroundSrc} alt="" fill sizes="100vw" draggable={false} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--minsi-bg)_58%,transparent)_0%,color-mix(in_srgb,var(--minsi-bg-soft)_42%,transparent)_48%,color-mix(in_srgb,var(--minsi-mobile-bg-end)_54%,transparent)_100%)]" />
        <SiteHeader variant="mobile" showNav={showNav} showLogin={false} logoHref="/" lang={lang} localized={localized} onLanguageChange={onLanguageChange} />
        <div className={mobileContentClassName}>{children}</div>
        {safetyText ? <SafetyNotice variant="mobile" text={safetyText} className={mobileSafetyNoticeClassName} /> : null}
      </section>
    </main>
  );
}
