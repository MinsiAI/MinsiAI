import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LanguageProvider } from "../lib/i18n/useLanguagePreference";
import { htmlLangAttribute, isMinsiLang, languageFromAcceptLanguage, LANGUAGE_COOKIE_NAME } from "../lib/i18n/language";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://minsi.ai"),
  title: "Minsi",
  description: "Minsi homepage recreated from Figma",
  icons: {
    icon: "/figma-assets/logo-mark.png"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const initialLang = isMinsiLang(cookieLanguage) ? cookieLanguage : languageFromAcceptLanguage(requestHeaders.get("accept-language"));

  return (
    <html lang={htmlLangAttribute(initialLang)}>
      <body>
        <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
