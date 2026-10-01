"use client";

import { useI18n } from "@/lib/i18n-context";
import GitHubIcon, { GITHUB_REPO_URL } from "./GitHubIcon";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border px-4 py-2" role="contentinfo">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-muted-foreground">
        <span>
          LocalWhisper.app by Dj&apos;Wincha — {t.footerPrivacy}
        </span>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <GitHubIcon className="size-3" />
          github.com/Wincha/localwhisper-app
        </a>
        <span>{t.footerBuiltWith}</span>
      </div>
    </footer>
  );
}
