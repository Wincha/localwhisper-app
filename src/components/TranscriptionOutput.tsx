"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import type { TranscriptionResult } from "@/lib/whisper";
import type { Translations } from "@/lib/i18n";
import { toSRT, toVTT, downloadFile, downloadBlob } from "@/lib/formats";
import { muxSubtitles } from "@/lib/ffmpeg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TranscriptionOutputProps {
  result: TranscriptionResult;
  videoFile?: File | null;
}

export default function TranscriptionOutput({
  result,
  videoFile,
}: TranscriptionOutputProps) {
  const { t } = useI18n();
  const [copyLabel, setCopyLabel] = useState<string | null>(null);
  const [muxStatus, setMuxStatus] = useState<"idle" | "muxing" | "done">("idle");

  const handleCopy = () => {
    navigator.clipboard.writeText(result.text);
    setCopyLabel(t.copied);
    setTimeout(() => setCopyLabel(null), 1500);
  };

  const handleDownloadTxt = () => downloadFile(result.text, "transcription.txt");
  const handleDownloadSrt = () => {
    if (result.chunks) downloadFile(toSRT(result.chunks), "transcription.srt");
  };
  const handleDownloadVtt = () => {
    if (result.chunks) downloadFile(toVTT(result.chunks), "transcription.vtt");
  };

  const handleAddSubtitles = async () => {
    if (!videoFile || !result.chunks) return;
    setMuxStatus("muxing");
    try {
      const srt = toSRT(result.chunks);
      const blob = await muxSubtitles(videoFile, srt);
      setMuxStatus("done");
      const baseName = videoFile.name.replace(/\.[^.]+$/, "");
      const ext = videoFile.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      downloadBlob(blob, `${baseName}_subs${ext}`);
      setTimeout(() => setMuxStatus("idle"), 2000);
    } catch (err) {
      console.error("Mux error:", err);
      setMuxStatus("idle");
    }
  };

  return (
    <Card size="sm" role="region" aria-label={t.transcription}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-xs">{t.transcription}</CardTitle>
          <div className="flex gap-1 flex-wrap justify-end" role="toolbar" aria-label="Export options">
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-[10px] h-6 px-2">
              {copyLabel ?? t.copy}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="text-[10px] h-6 px-2">
              .txt
            </Button>
            {result.chunks && (
              <>
                <Button variant="outline" size="sm" onClick={handleDownloadSrt} className="text-[10px] h-6 px-2">
                  .srt
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadVtt} className="text-[10px] h-6 px-2">
                  .vtt
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {result.chunks ? (
          <div
            className="bg-background/50 rounded-lg p-3 max-h-56 overflow-y-auto space-y-1.5"
            role="log"
            aria-label={t.transcription}
            tabIndex={0}
          >
            {result.chunks.map((chunk, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-primary font-mono text-[10px] whitespace-nowrap pt-0.5" aria-label={`${formatTimestamp(chunk.timestamp[0])}`}>
                  {formatTimestamp(chunk.timestamp[0])}
                </span>
                <span className="text-foreground">{chunk.text.trim()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-background/50 rounded-lg p-3 max-h-56 overflow-y-auto"
            tabIndex={0}
          >
            <p className="text-xs text-foreground whitespace-pre-wrap">
              {result.text}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[9px] font-normal">
              {t.modelInfo}: {t[result.model as keyof Translations]}
            </Badge>
            <Badge variant="secondary" className="text-[9px] font-normal">
              {t.backendInfo}: {result.backend.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="text-[9px] font-normal">
              {t.timeInfo}: {result.duration.toFixed(1)}s
            </Badge>
          </div>

          {videoFile && result.chunks && (
            <Button
              onClick={handleAddSubtitles}
              disabled={muxStatus === "muxing"}
              size="sm"
              variant={muxStatus === "done" ? "outline" : "default"}
              className={`text-[10px] h-7 ${muxStatus === "done" ? "text-success border-success" : ""}`}
              aria-label={t.addSubtitles}
              title={t.softSubsTooltip}
            >
              {muxStatus === "idle" && t.addSubtitles}
              {muxStatus === "muxing" && t.addingSubtitles}
              {muxStatus === "done" && t.subtitlesAdded}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
