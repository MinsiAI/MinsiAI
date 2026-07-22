export const supportedLanguages = ["zh", "en"] as const;

export type MinsiLang = (typeof supportedLanguages)[number];

export const LANGUAGE_STORAGE_KEY = "minsi.language";
export const LANGUAGE_COOKIE_NAME = "minsi.language";

export function isMinsiLang(value: unknown): value is MinsiLang {
  return value === "zh" || value === "en";
}

export function languageFromBrowser(languages: readonly string[]): MinsiLang {
  const primaryLanguage = languages[0]?.trim().toLowerCase();

  return primaryLanguage?.startsWith("zh") ? "zh" : "en";
}

export function languageFromAcceptLanguage(acceptLanguage: string | null | undefined): MinsiLang {
  if (!acceptLanguage) {
    return "zh";
  }

  const languages = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);

  return languageFromBrowser(languages);
}

export function htmlLangAttribute(lang: MinsiLang) {
  return lang === "zh" ? "zh-CN" : "en";
}
