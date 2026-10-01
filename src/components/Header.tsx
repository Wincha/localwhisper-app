"use client";

import { useI18n } from "@/lib/i18n-context";
import LocaleSwitcher from "./LocaleSwitcher";
import GitHubIcon, { GITHUB_REPO_URL } from "./GitHubIcon";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="border-b border-border px-4 py-2" role="banner">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">
            LocalWhisper
            <span className="text-muted-foreground font-normal text-xs">.app</span>
          </h1>
          <p className="text-[10px] text-muted-foreground">by Dj&apos;Wincha</p>
        </div>
        <div className="flex items-center gap-3">
          <p
            className="text-[10px] text-muted-foreground hidden sm:block max-w-[200px] text-right leading-tight"
            aria-label={t.headerTagline}
          >
            {t.headerTagline}
          </p>
          <LocaleSwitcher />
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
