"use client";

import Image from "next/image";
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AUTH_SESSION_CHANGED_EVENT, getCurrentUser, logoutCurrentSession, type CurrentUser } from "../../lib/auth/session-api";
import { providerName, siteHeaderMessages } from "../../lib/i18n/messages";
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
  localized?: boolean;
  onLanguageChange?: (lang: MinsiLang) => void;
}

const navItems: Array<{ key: SiteNavKey; href: string }> = [
  { key: "about", href: "/about" },
  { key: "privacy", href: "/privacy" },
  { key: "research", href: "/research" }
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

function HeaderNav({ activeNav, messages }: { activeNav?: SiteNavKey; messages: (typeof siteHeaderMessages)[MinsiLang] }) {
  return (
    <nav className="desktop-nav">
      {navItems.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? <span /> : null}
          <a className={activeNav === item.key ? "is-active" : undefined} href={item.href} aria-current={activeNav === item.key ? "page" : undefined}>
            {messages.nav[item.key]}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

function EmailAvatarIcon() {
  return (
    <svg className="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5.2 8.2 6.8 5 6.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountAvatar({ user }: { user: CurrentUser }) {
  if (user.authProvider === "wechat") {
    return (
      <span className="site-account-avatar site-account-avatar-wechat" aria-hidden="true">
        <Image src="/figma-assets/login-wechat.svg" alt="" width={24} height={24} draggable={false} />
      </span>
    );
  }

  if (user.authProvider === "qq") {
    return (
      <span className="site-account-avatar site-account-avatar-qq" aria-hidden="true">
        <Image src="/figma-assets/login-qq.svg" alt="" width={24} height={24} draggable={false} />
      </span>
    );
  }

  return (
    <span className="site-account-avatar site-account-avatar-email" aria-hidden="true">
      <EmailAvatarIcon />
    </span>
  );
}

function AuthAccountAction({ anonymousFallback = true, compact = false, lang, messages }: { anonymousFallback?: boolean; compact?: boolean; lang: MinsiLang; messages: (typeof siteHeaderMessages)[MinsiLang] }) {
  const pathname = usePathname();
  const accountRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function refreshCurrentUser() {
      getCurrentUser()
        .then((user) => {
          if (!cancelled) {
            setCurrentUser(user.authenticated ? user : null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCurrentUser(null);
          }
        });
    }

    refreshCurrentUser();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, refreshCurrentUser);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, refreshCurrentUser);
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const account = accountRef.current;
      if (account && event.target instanceof Node && !account.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);
    try {
      await logoutCurrentSession();
      setCurrentUser(null);
      setMenuOpen(false);
    } catch {
      setCurrentUser(null);
      setMenuOpen(false);
    } finally {
      setLogoutLoading(false);
    }
  }

  if (!currentUser) {
    if (!anonymousFallback) {
      return null;
    }

    return (
      <MinsiButton href="/login" className="desktop-login">
        {messages.login}
      </MinsiButton>
    );
  }

  const localizedProviderName = providerName(lang, currentUser.authProvider, currentUser.providerLabel);
  const accountLabel = messages.signedIn(localizedProviderName, currentUser.emailMasked);
  const menuTitle = messages.signedIn(localizedProviderName);
  const accountDetail = currentUser.emailMasked ?? messages.providerAccount(localizedProviderName);

  return (
    <div className={compact ? "site-account site-account-compact" : "site-account"} ref={accountRef}>
      <button
        className="site-account-trigger"
        type="button"
        aria-label={accountLabel}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <AccountAvatar user={currentUser} />
      </button>
      {menuOpen ? (
        <div className="site-account-menu" role="menu">
          <div className="site-account-menu-header">
            <AccountAvatar user={currentUser} />
            <div className="min-w-0">
              <p className="site-account-menu-title">{menuTitle}</p>
              <p className="site-account-menu-detail">{accountDetail}</p>
            </div>
          </div>
          <button className="site-account-logout" type="button" role="menuitem" onClick={handleLogout} disabled={logoutLoading}>
            {logoutLoading ? messages.loggingOut : messages.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DefaultDesktopActions({ lang, showLogin, localized, messages, onLanguageChange }: { lang: MinsiLang; showLogin: boolean; localized: boolean; messages: (typeof siteHeaderMessages)[MinsiLang]; onLanguageChange?: (lang: MinsiLang) => void }) {
  return (
    <div className="desktop-auth-actions">
      <LanguageSwitch lang={lang} localized={localized} onChange={onLanguageChange} />
      {showLogin ? <AuthAccountAction lang={lang} messages={messages} /> : null}
    </div>
  );
}

export function SiteHeader({ showNav = true, showLogin = true, transparent: _transparent = true, lang = "zh", logoHref = "/", logoSize, className, variant = "desktop", activeNav, actions, localized = false, onLanguageChange }: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileMenuId = useId();
  const mobileHeaderRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messages = localized ? siteHeaderMessages[lang] : siteHeaderMessages.zh;
  const mobileNavItems = [
    { label: messages.home, href: "/" },
    ...navItems.map(({ key, href }) => ({ label: messages.nav[key], href }))
  ];

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
          <MinsiLogo href={logoHref} size={logoSize ?? "sm"} className="mobile-logo" ariaLabel={messages.logoLabel} />
          <div className="mobile-header-actions">
            <LanguageSwitch compact lang={lang} localized={localized} onChange={onLanguageChange} />
            {showNav ? (
              <button
                className="mobile-menu-button"
                type="button"
                aria-controls={mobileMenuId}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? messages.closeMenu : messages.openMenu}
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
            {showLogin ? <AuthAccountAction anonymousFallback={false} compact lang={lang} messages={messages} /> : null}
            {actions}
          </div>
          {mobileMenuOpen ? <button className="mobile-menu-backdrop" type="button" aria-label={messages.closeMenu} onClick={() => setMobileMenuOpen(false)} /> : null}
          {showNav ? (
            <nav className="mobile-nav-popover" id={mobileMenuId} aria-label={messages.mobileNavigation} hidden={!mobileMenuOpen}>
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
        <MinsiLogo href={logoHref} size={logoSize ?? "lg"} className="desktop-logo" ariaLabel={messages.logoLabel} />
        <div className="desktop-header-actions">
          {showNav ? <HeaderNav activeNav={activeNav} messages={messages} /> : null}
          {actions ?? <DefaultDesktopActions lang={lang} showLogin={showLogin} localized={localized} messages={messages} onLanguageChange={onLanguageChange} />}
        </div>
      </div>
    </header>
  );
}
