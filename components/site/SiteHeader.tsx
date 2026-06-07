"use client";

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitch, type MinsiLang } from "./LanguageSwitch";
import { MinsiButton } from "./MinsiButton";
import { MinsiLogo } from "./MinsiLogo";

export type SiteNavKey = "about" | "privacy" | "research";

export interface SiteHeaderProps {
  showNav?: boolean;
  showLogin?: boolean;
  transparent?: boolean;
  lang?: MinsiLang;
  logoHref?: string;
  logoSize?: "sm" | "md" | "lg";
  className?: string;
  variant?: "desktop" | "mobile";
  activeNav?: SiteNavKey;
  actions?: ReactNode;
}

const navItems: Array<{ key: SiteNavKey; label: string; href: string }> = [
  { key: "about", label: "关于Minsi", href: "/about" },
  { key: "privacy", label: "隐私与安全", href: "/privacy" },
  { key: "research", label: "匿名心声", href: "/research" }
];

const mobileNavItems = [
  { label: "首页", href: "/" },
  ...navItems.map(({ label, href }) => ({ label, href }))
];

const closeLanguageMenuEvent = "minsi:close-language-menu";
const closeMobileMenuEvent = "minsi:close-mobile-menu";

function MenuIcon() {
  return (
    <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeaderNav({ activeNav }: { activeNav?: SiteNavKey }) {
  return (
    <nav className="desktop-nav">
      {navItems.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? <span /> : null}
          <a className={activeNav === item.key ? "is-active" : undefined} href={item.href} aria-current={activeNav === item.key ? "page" : undefined}>
            {item.label}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

function DefaultDesktopActions({ lang, showLogin }: { lang: MinsiLang; showLogin: boolean }) {
  return (
    <div className="desktop-auth-actions">
      <LanguageSwitch lang={lang} />
      {showLogin ? (
        <MinsiButton href="/login" className="desktop-login">
          登录 / 注册
        </MinsiButton>
      ) : null}
    </div>
  );
}

export function SiteHeader({ showNav = true, showLogin = true, transparent: _transparent = true, lang = "zh", logoHref = "/", logoSize, className, variant = "desktop", activeNav, actions }: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileMenuId = useId();
  const mobileHeaderRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function closeMobileMenu() {
      setMobileMenuOpen(false);
    }

    window.addEventListener(closeMobileMenuEvent, closeMobileMenu);

    return () => window.removeEventListener(closeMobileMenuEvent, closeMobileMenu);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    function closeMobileMenu() {
      setMobileMenuOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      const header = mobileHeaderRef.current;

      if (header && event.target instanceof Node && !header.contains(event.target)) {
        closeMobileMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchmove", closeMobileMenu, { passive: true });
    window.addEventListener("wheel", closeMobileMenu, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchmove", closeMobileMenu);
      window.removeEventListener("wheel", closeMobileMenu);
    };
  }, [mobileMenuOpen]);

  function isMobileNavActive(href: string) {
    if (!pathname) {
      return false;
    }

    return pathname === href;
  }

  if (variant === "mobile") {
    return (
      <>
        <header className={["mobile-header", className].filter(Boolean).join(" ")} ref={mobileHeaderRef}>
          <MinsiLogo href={logoHref} size={logoSize ?? "sm"} className="mobile-logo" />
          <div className="mobile-header-actions">
            <LanguageSwitch compact lang={lang} />
            {showNav ? (
              <button
                className="mobile-menu-button"
                type="button"
                aria-controls={mobileMenuId}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
                onClick={() => {
                  if (!mobileMenuOpen) {
                    window.dispatchEvent(new Event(closeLanguageMenuEvent));
                  }

                  setMobileMenuOpen((current) => !current);
                }}
              >
                <MenuIcon />
              </button>
            ) : null}
            {actions}
          </div>
          {mobileMenuOpen ? <button className="mobile-menu-backdrop" type="button" aria-label="关闭菜单" onClick={() => setMobileMenuOpen(false)} /> : null}
          {showNav ? (
            <nav className="mobile-nav-popover" id={mobileMenuId} aria-label="移动端页面导航" hidden={!mobileMenuOpen}>
              {mobileNavItems.map((item) => {
                const isActive = isMobileNavActive(item.href);

                return (
                  <a className={isActive ? "mobile-nav-link is-active" : "mobile-nav-link"} href={item.href} aria-current={isActive ? "page" : undefined} key={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </a>
                );
              })}
            </nav>
          ) : null}
        </header>
        <div className="mobile-header-spacer" aria-hidden="true" />
      </>
    );
  }

  return (
    <header className={["desktop-header", className].filter(Boolean).join(" ")}>
      <div className="desktop-header-inner">
        <MinsiLogo href={logoHref} size={logoSize ?? "lg"} className="desktop-logo" />
        <div className="desktop-header-actions">
          {showNav ? <HeaderNav activeNav={activeNav} /> : null}
          {actions ?? <DefaultDesktopActions lang={lang} showLogin={showLogin} />}
        </div>
      </div>
    </header>
  );
}
