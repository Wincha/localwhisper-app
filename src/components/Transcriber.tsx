"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ProgressInfo } from "@huggingface/transformers";
import { useI18n } from "@/lib/i18n-context";
import { detectBrowserWhisperLang } from "@/lib/i18n";
import {
  transcribe,
  type WhisperModel,
  type Backend,
  type TranscriptionResult,
  MODELS,
} from "@/lib/whisper";
import { isVideoFile, extractAudioAsWav } from "@/lib/ffmpeg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ModelSelector from "./ModelSelector";
import BackendSelector from "./BackendSelector";
import FileUploader from "./FileUploader";
import ProgressBar from "./ProgressBar";
import TranscriptionOutput from "./TranscriptionOutput";

type Status =
  | "idle"
  | "extracting-audio"
  | "loading-model"
  | "transcribing"
  | "done"
  | "error";

interface LangOption {
  value: string;
  label: string;
  isAutoDetect?: boolean;
}

const LANGUAGES: LangOption[] = [
  { value: "", label: "", isAutoDetect: true },
  { value: "spanish", label: "Español" },
  { value: "english", label: "English" },
  { value: "french", label: "Français" },
  { value: "german", label: "Deutsch" },
  { value: "italian", label: "Italiano" },
  { value: "portuguese", label: "Português" },
  { value: "japanese", label: "日本語" },
  { value: "chinese", label: "中文" },
  { value: "korean", label: "한국어" },
  { value: "arabic", label: "العربية" },
  { value: "russian", label: "Русский" },
  { value: "dutch", label: "Nederlands" },
  { value: "catalan", label: "Català" },
];

export default function Transcriber() {
  const { t } = useI18n();
  const [model, setModel] = useState<WhisperModel>("base");
  const [backend, setBackend] = useState<Backend>("wasm");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelProgressDetail, setModelProgressDetail] = useState("");
  const [ffmpegProgress, setFfmpegProgress] = useState(0);

  const fileRef = useRef<File | null>(null);
  const langInitialized = useRef(false);

  useEffect(() => {
    if (!langInitialized.current) {
      langInitialized.current = true;
      const detected = detectBrowserWhisperLang();
      if (detected) setLanguage(detected);
    }
  }, []);

  const isProcessing =
    status !== "idle" && status !== "done" && status !== "error";

  const handleFile = useCallback((file: File) => {
    fileRef.current = file;
    setResult(null);
    setError(null);
    setStatus("idle");
  }, []);

  const handleTranscribe = useCallback(async () => {
    const file = fileRef.current;
    if (!file) return;

    setError(null);
    setResult(null);
    setModelProgress(0);
    setFfmpegProgress(0);

    try {
      let audioSource: string | Float32Array;

      if (isVideoFile(file)) {
        setStatus("extracting-audio");
        const audioBlob = await extractAudioAsWav(file, (ratio) => {
          setFfmpegProgress(ratio * 100);
        });
        audioSource = URL.createObjectURL(audioBlob);
      } else {
        audioSource = URL.createObjectURL(file);
      }

      setStatus("loading-model");

      const onModelProgress = (p: ProgressInfo) => {
        if (p.status === "progress" && "progress" in p) {
          setModelProgress(p.progress);
          setModelProgressDetail(`${t.downloadingFile} ${p.file}...`);
        }
        if (p.status === "done") {
          setModelProgressDetail(t.modelReady);
        }
        if (p.status === "ready") {
          setStatus("transcribing");
          setModelProgress(100);
        }
      };

      const transcriptionResult = await transcribe(audioSource, {
        model,
        backend,
        language: language || undefined,
        timestamps: true,
        onModelProgress,
      });

      setResult(transcriptionResult);
      setStatus("done");
    } catch (err) {
      console.error("Transcription error:", err);
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [model, backend, language, t]);

  const modelInfo = MODELS[model];

  return (
    <div className="space-y-3" role="form" aria-label={t.transcribe}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ModelSelector
          value={model}
          onChange={setModel}
          disabled={isProcessing}
        />
        <BackendSelector
          value={backend}
          onChange={setBackend}
          disabled={isProcessing}
        />
      </div>

      {modelInfo.multilingual && (
        <div className="space-y-1.5">
          <Label htmlFor="language-select" className="text-xs">
            {t.language}
          </Label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isProcessing}
            aria-label={t.language}
            className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.isAutoDetect ? t.autoDetect : l.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <FileUploader onFile={handleFile} disabled={isProcessing} />

      <Button
        onClick={handleTranscribe}
        disabled={!fileRef.current || isProcessing}
        size="lg"
        className="w-full"
        aria-busy={isProcessing}
        aria-live="polite"
      >
        {status === "idle" && t.transcribe}
        {status === "extracting-audio" && t.extractingAudio}
        {status === "loading-model" && t.loadingModel}
        {status === "transcribing" && t.transcribing}
        {status === "done" && t.transcribeAgain}
        {status === "error" && t.retry}
      </Button>

      <div aria-live="polite" aria-atomic="true">
        {status === "extracting-audio" && (
          <ProgressBar
            label={t.extractingAudioFromVideo}
            progress={ffmpegProgress}
            detail={t.extractingAudioDetail}
          />
        )}

        {(status === "loading-model" || status === "transcribing") && (
          <ProgressBar
            label={
              status === "loading-model" ? t.downloadingModel : t.transcribing
            }
            progress={status === "transcribing" ? 100 : modelProgress}
            detail={
              status === "transcribing"
                ? `${t.runningWhisper} ${backend.toUpperCase()}`
                : modelProgressDetail
            }
          />
        )}
      </div>

      {error && (
        <Card size="sm" className="border-destructive bg-destructive/10" role="alert">
          <CardContent>
            <p className="text-xs text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <TranscriptionOutput
          result={result}
          videoFile={fileRef.current && isVideoFile(fileRef.current) ? fileRef.current : null}
        />
      )}

      <div className="pt-2">
        <p className="text-[10px] text-muted-foreground mb-1.5">{t.librariesUsed}</p>
        <div className="flex flex-wrap gap-1.5" role="list" aria-label={t.librariesUsed}>
          <Badge variant="outline" className="text-[9px] font-normal" role="listitem">
            @huggingface/transformers
          </Badge>
          <Badge variant="outline" className="text-[9px] font-normal" role="listitem">
            ONNX Runtime ({backend === "webgpu" ? "WebGPU" : "WASM"})
          </Badge>
          <Badge variant="outline" className="text-[9px] font-normal" role="listitem">
            {modelInfo.id}
          </Badge>
          {fileRef.current && isVideoFile(fileRef.current) && (
            <Badge variant="outline" className="text-[9px] font-normal" role="listitem">
              @ffmpeg/ffmpeg ({t.audioExtraction})
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
