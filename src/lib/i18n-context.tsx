"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Locale, type Translations, detectBrowserLocale, t } from "./i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  mounted: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: t("en"),
  mounted: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(detectBrowserLocale());
    setMounted(true);
  }, []);

  // Don't render children until client is mounted to avoid hydration mismatch
  // from browser-detected locale and base-ui generated IDs
  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: t(locale), mounted }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
