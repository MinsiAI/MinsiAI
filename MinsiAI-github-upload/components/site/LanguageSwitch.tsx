"use client";

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

export function LanguageSwitch({ lang = "zh", onChange, compact = false, className }: LanguageSwitchProps) {
  const label = lang === "zh" ? "中文" : "English";
  const iconClassName = compact ? "mobile-language-icon" : "desktop-header-icon";
  const buttonClassName =
    className ??
    (compact
      ? "mobile-language"
      : "desktop-language");

  return (
    <button
      className={buttonClassName}
      type="button"
      onClick={() => onChange?.(lang === "zh" ? "en" : "zh")}
      aria-label="切换语言"
    >
      <GlobeIcon className={iconClassName} />
      {label}
      <ChevronIcon className={iconClassName} />
    </button>
  );
}
