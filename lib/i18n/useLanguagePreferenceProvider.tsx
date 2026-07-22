"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { htmlLangAttribute, isMinsiLang, LANGUAGE_COOKIE_NAME, LANGUAGE_STORAGE_KEY, languageFromBrowser, type MinsiLang } from "./language";

const languagePreferenceChangedEvent = "minsi:language-preference-changed";
const languageCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

interface LanguagePreferenceValue {
  lang: MinsiLang;
  changeLanguage: (nextLanguage: MinsiLang) => void;
}

const LanguagePreferenceContext = createContext<LanguagePreferenceValue | null>(null);

function browserLanguages(): readonly string[] {
  if (navigator.languages.length > 0) {
    return navigator.languages;
  }

  return navigator.language ? [navigator.language] : [];
}

function storedLanguagePreference() {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistLanguagePreference(nextLanguage: MinsiLang) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  } catch {
    // Keep the in-memory selection usable when storage is unavailable.
  }

  try {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${nextLanguage}; Path=/; Max-Age=${languageCookieMaxAgeSeconds}; SameSite=Lax`;
  } catch {
    // Cookie persistence is best-effort and contains only the non-sensitive language code.
  }

  document.documentElement.lang = htmlLangAttribute(nextLanguage);
}

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: MinsiLang }) {
  const [lang, setLang] = useState<MinsiLang>(initialLang);

  useEffect(() => {
    const storedLanguage = storedLanguagePreference();
    const nextLanguage = isMinsiLang(storedLanguage) ? storedLanguage : initialLang;

    if (nextLanguage !== lang) {
      setLang(nextLanguage);
    }

    if (isMinsiLang(storedLanguage)) {
      persistLanguagePreference(storedLanguage);
    } else {
      document.documentElement.lang = htmlLangAttribute(nextLanguage);
    }
  }, [initialLang, lang]);

  useEffect(() => {
    function syncFromStorage(event: StorageEvent) {
      if (event.key === LANGUAGE_STORAGE_KEY && isMinsiLang(event.newValue)) {
        setLang(event.newValue);
        persistLanguagePreference(event.newValue);
      }
    }

    function syncFromCurrentTab(event: Event) {
      const nextLanguage = (event as CustomEvent<unknown>).detail;

      if (isMinsiLang(nextLanguage)) {
        setLang(nextLanguage);
        persistLanguagePreference(nextLanguage);
      }
    }

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(languagePreferenceChangedEvent, syncFromCurrentTab);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(languagePreferenceChangedEvent, syncFromCurrentTab);
    };
  }, []);

  const changeLanguage = useCallback((nextLanguage: MinsiLang) => {
    setLang(nextLanguage);
    persistLanguagePreference(nextLanguage);
    window.dispatchEvent(new CustomEvent(languagePreferenceChangedEvent, { detail: nextLanguage }));
  }, []);

  const contextValue = useMemo(() => ({ lang, changeLanguage }), [changeLanguage, lang]);

  return <LanguagePreferenceContext.Provider value={contextValue}>{children}</LanguagePreferenceContext.Provider>;
}

export function useLanguagePreference(): LanguagePreferenceValue {
  const contextValue = useContext(LanguagePreferenceContext);

  if (!contextValue) {
    const fallbackLanguage = typeof navigator === "undefined" ? "zh" : languageFromBrowser(browserLanguages());

    return {
      lang: fallbackLanguage,
      changeLanguage: () => {
        // Pages are expected to be wrapped in LanguageProvider from app/layout.tsx.
      }
    };
  }

  return contextValue;
}
