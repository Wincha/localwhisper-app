"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n-context";
import { MODELS, type WhisperModel } from "@/lib/whisper";
import { Label } from "@/components/ui/label";
import type { Translations } from "@/lib/i18n";

interface ModelSelectorProps {
  value: WhisperModel;
  onChange: (model: WhisperModel) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  const { t } = useI18n();
  const entries = useMemo(
    () => Object.entries(MODELS) as [WhisperModel, (typeof MODELS)[WhisperModel]][],
    []
  );
  const modelInfo = MODELS[value];

  return (
    <div className="space-y-1.5">
      <Label htmlFor="model-select" className="text-xs">
        {t.model}
      </Label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value as WhisperModel)}
        disabled={disabled}
        aria-describedby="model-info"
        className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {entries.map(([key, info]) => (
          <option key={key} value={key}>
            {t[info.nameKey as keyof Translations]} — {info.size}
          </option>
        ))}
      </select>
      <p id="model-info" className="text-[10px] text-muted-foreground truncate">
        {t.poweredBy}{" "}
        <span className="text-primary">transformers.js</span>
        {" · "}
        <span className="font-mono">{modelInfo.id}</span>
      </p>
    </div>
  );
}
