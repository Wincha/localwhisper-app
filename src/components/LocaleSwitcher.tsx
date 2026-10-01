"use client";

import { useI18n } from "@/lib/i18n-context";
import { UI_LOCALE_LABELS, type Locale } from "@/lib/i18n";

const locales = Object.entries(UI_LOCALE_LABELS) as [Locale, string][];

export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div>
      <label htmlFor="locale-select" className="sr-only">
        {t.uiLanguage}
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t.uiLanguage}
        className="bg-card border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {locales.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
