"use client";

import { AuthCard } from "./AuthCard";
import { BrandPageChrome } from "../site/BrandPageChrome";
import { loginMessages } from "../../lib/i18n/messages";
import { useLanguagePreference } from "../../lib/i18n/useLanguagePreference";

export function LoginPageShell() {
  const { lang, changeLanguage } = useLanguagePreference();
  const copy = loginMessages[lang];

  return (
    <BrandPageChrome
      showNav
      showLogin
      localized
      lang={lang}
      onLanguageChange={changeLanguage}
      backgroundSrc="/figma-assets/login-pc-bg.png"
      mobileBackgroundSrc="/figma-assets/login-mobile-bg.jpg"
      safetyText={copy.safetyText}
      safetyNoticeClassName="hidden"
      mobileSafetyNoticeClassName="login-mobile-bottom-notice relative z-10 mx-auto flex items-start justify-center text-center text-[var(--minsi-safety-mobile)]"
      desktopContentClassName="login-auth-slot absolute left-1/2 z-[var(--z-card)] -translate-x-1/2"
      mobileContentClassName="login-mobile-auth-slot relative z-[var(--z-content)] mx-auto flex w-full max-w-[398px] justify-center"
    >
      <AuthCard copy={copy} />
    </BrandPageChrome>
  );
}
