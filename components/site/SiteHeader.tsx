"use client";

import type { ReactNode } from "react";
import { LanguageSwitch, type MinsiLang } from "./LanguageSwitch";
import { MinsiButton } from "./MinsiButton";
import { MinsiLogo } from "./MinsiLogo";

export interface SiteHeaderProps {
  showNav?: boolean;
  showLogin?: boolean;
  transparent?: boolean;
  lang?: MinsiLang;
  logoHref?: string;
  logoSize?: "sm" | "md" | "lg";
  className?: string;
  variant?: "desktop" | "mobile";
  actions?: ReactNode;
}

function MenuIcon() {
  return (
    <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeaderNav() {
  return (
    <nav className="desktop-nav">
      <a href="#">关于Minsi</a>
      <span />
      <a href="#">隐私与安全</a>
      <span />
      <a href="#">用户研究</a>
    </nav>
  );
}

export function SiteHeader({ showNav = true, showLogin = true, transparent: _transparent = true, lang = "zh", logoHref = "#", logoSize, className, variant = "desktop", actions }: SiteHeaderProps) {
  if (variant === "mobile") {
    return (
      <header className={className ?? "mobile-header"}>
        <MinsiLogo href={logoHref} size={logoSize ?? "sm"} className="mobile-logo" />
        <div className="mobile-header-actions">
          {actions ?? (
            <>
              <LanguageSwitch compact lang={lang} />
              {showNav ? (
                <button className="mobile-menu-button" type="button" aria-label="打开菜单">
                  <MenuIcon />
                </button>
              ) : null}
            </>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className={className ?? "desktop-header"}>
      <div className="desktop-header-inner">
        <MinsiLogo href={logoHref} size={logoSize ?? "lg"} className="desktop-logo" />
        <div className="desktop-header-actions">
          {actions ?? (
            <>
              {showNav ? <HeaderNav /> : null}
              <div className="desktop-auth-actions">
                <LanguageSwitch lang={lang} />
                {showLogin ? (
                  <MinsiButton href="/login" className="desktop-login">
                    登录 / 注册
                  </MinsiButton>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
