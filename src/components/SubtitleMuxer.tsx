"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n-context";
import { muxSubtitles } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/formats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DropZone from "./DropZone";
import ProgressBar from "./ProgressBar";

type MuxStatus = "idle" | "processing" | "done" | "error";

export default function SubtitleMuxer() {
  const { t } = useI18n();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subsFile, setSubsFile] = useState<File | null>(null);
  const [status, setStatus] = useState<MuxStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleMux = useCallback(async () => {
    if (!videoFile || !subsFile) return;
    setStatus("processing");
    setProgress(0);
    setError(null);

    try {
      const subsText = await subsFile.text();
      const blob = await muxSubtitles(videoFile, subsText, (ratio) => {
        setProgress(ratio * 100);
      });

      const baseName = videoFile.name.replace(/\.[^.]+$/, "");
      const ext = videoFile.name.match(/\.[^.]+$/)?.[0] || ".mp4";
      downloadBlob(blob, `${baseName}_subs${ext}`);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Mux error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [videoFile, subsFile]);

  return (
    <div className="space-y-3" role="form" aria-label={t.muxerTab}>
      <p className="text-xs text-muted-foreground text-center">{t.muxerDescription}</p>

      <DropZone
        label={t.dropVideoFile}
        accept="video/*,.mp4,.webm,.mkv,.avi,.mov"
        file={videoFile}
        onFile={setVideoFile}
        disabled={status === "processing"}
      />

      <DropZone
        label={t.dropSubtitleFile}
        accept=".srt,.vtt"
        detail={t.srtVttFormats}
        file={subsFile}
        onFile={setSubsFile}
        disabled={status === "processing"}
        className="py-4"
      />

      <Button
        onClick={handleMux}
        disabled={!videoFile || !subsFile || status === "processing"}
        size="lg"
        className="w-full"
        aria-busy={status === "processing"}
      >
        {status === "processing" ? t.muxing : t.muxAndDownload}
      </Button>

      <div aria-live="polite">
        {status === "processing" && (
          <ProgressBar
            label={t.addingSubtitles}
            progress={progress}
            detail="FFmpeg.wasm — @ffmpeg/ffmpeg"
          />
        )}

        {status === "done" && (
          <p className="text-xs text-center" style={{ color: "var(--success)" }} role="status">
            {t.subtitlesAdded}
          </p>
        )}

        {error && (
          <Card size="sm" className="border-destructive bg-destructive/10" role="alert">
            <CardContent>
              <p className="text-xs text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pt-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[9px] font-normal">
            @ffmpeg/ffmpeg
          </Badge>
          <Badge variant="outline" className="text-[9px] font-normal">
            {t.softSubsTooltip}
          </Badge>
        </div>
      </div>
    </div>
  );
}
