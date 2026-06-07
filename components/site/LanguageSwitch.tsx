"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type MinsiLang = "zh" | "en";

export interface LanguageSwitchProps {
  lang?: MinsiLang;
  onChange?: (lang: MinsiLang) => void;
  compact?: boolean;
  className?: string;
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17M12 3c2.2 2.5 3.4 5.5 3.4 9S14.2 18.5 12 21M12 3c-2.2 2.5-3.4 5.5-3.4 9s1.2 6.5 3.4 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 7 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const languageOptions: Array<{ lang: MinsiLang; label: string }> = [
  { lang: "zh", label: "中文" },
  { lang: "en", label: "English" }
];

const closeLanguageMenuEvent = "minsi:close-language-menu";
const closeMobileMenuEvent = "minsi:close-mobile-menu";

export function LanguageSwitch({ lang = "zh", onChange, compact = false, className }: LanguageSwitchProps) {
  const menuId = useId();
  const switchRef = useRef<HTMLDivElement>(null);
  const [selectedLang, setSelectedLang] = useState<MinsiLang>(lang);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const label = selectedLang === "zh" ? "中文" : "English";
  const iconClassName = compact ? "mobile-language-icon" : "desktop-header-icon";
  const buttonClassName =
    className ??
    (compact
      ? "mobile-language"
      : "desktop-language");

  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function closeMenu() {
      setOpen(false);
    }

    window.addEventListener(closeLanguageMenuEvent, closeMenu);

    return () => window.removeEventListener(closeLanguageMenuEvent, closeMenu);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeMenu() {
      setOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      const switchElement = switchRef.current;

      if (switchElement && event.target instanceof Node && !switchElement.contains(event.target)) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchmove", closeMenu, { passive: true });
    window.addEventListener("wheel", closeMenu, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchmove", closeMenu);
      window.removeEventListener("wheel", closeMenu);
    };
  }, [open]);

  function selectLanguage(nextLang: MinsiLang) {
    setSelectedLang(nextLang);
    setOpen(false);
    onChange?.(nextLang);
  }

  return (
    <div className={compact ? "language-switch language-switch-compact" : "language-switch"} ref={switchRef}>
      {open && compact && mounted ? createPortal(<button className="language-menu-backdrop" type="button" aria-label="关闭语言菜单" onClick={() => setOpen(false)} />, document.body) : null}
      <button
        className={buttonClassName}
        type="button"
        onClick={() => {
          if (!open) {
            window.dispatchEvent(new Event(closeMobileMenuEvent));
          }

          setOpen((current) => !current);
        }}
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="切换语言"
      >
        <GlobeIcon className={iconClassName} />
        {label}
        <ChevronIcon className={iconClassName} />
      </button>
      <div className="language-menu" id={menuId} role="listbox" aria-label="选择语言" hidden={!open}>
        {languageOptions.map((option) => {
          const selected = option.lang === selectedLang;

          return (
            <button
              className={selected ? "language-menu-option is-active" : "language-menu-option"}
              key={option.lang}
              onClick={() => selectLanguage(option.lang)}
              role="option"
              type="button"
              aria-selected={selected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
