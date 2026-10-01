"use client";

import { useState } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Transcriber from "@/components/Transcriber";
import SubtitleMuxer from "@/components/SubtitleMuxer";
import Footer from "@/components/Footer";

function PageContent() {
  const { t } = useI18n();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1 px-4 py-4 overflow-y-auto" role="main">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              LocalWhisper<span className="text-primary">.app</span>
              <span className="text-muted-foreground text-xs font-normal ml-2">
                by Dj&apos;Wincha
              </span>
            </h2>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              {t.pageSubtitle}
            </p>
          </div>

          <Tabs defaultValue="transcribe">
            <TabsList variant="line" aria-label={t.transcribeTab}>
              <TabsTrigger value="transcribe">{t.transcribeTab}</TabsTrigger>
              <TabsTrigger value="muxer">{t.muxerTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="transcribe">
              <Transcriber />
            </TabsContent>
            <TabsContent value="muxer">
              <SubtitleMuxer />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <I18nProvider>
      <PageContent />
    </I18nProvider>
  );
}
