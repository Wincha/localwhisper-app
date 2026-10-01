"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { detectWebGPU, type Backend } from "@/lib/whisper";
import { Button } from "@/components/ui/button";

interface BackendSelectorProps {
  value: Backend;
  onChange: (backend: Backend) => void;
  disabled?: boolean;
}

export default function BackendSelector({
  value,
  onChange,
  disabled,
}: BackendSelectorProps) {
  const { t } = useI18n();
  const [webgpuAvailable, setWebgpuAvailable] = useState<boolean | null>(null);
  const [autoDetected, setAutoDetected] = useState<Backend | null>(null);

  useEffect(() => {
    detectWebGPU().then((available) => {
      setWebgpuAvailable(available);
      const detected = available ? "webgpu" : "wasm";
      setAutoDetected(detected);
      onChange(detected);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <fieldset className="space-y-1.5" disabled={disabled}>
      <legend className="text-xs font-medium">{t.backend}</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={t.backend}>
        <Button
          type="button"
          size="sm"
          variant={value === "webgpu" ? "default" : "outline"}
          onClick={() => onChange("webgpu")}
          disabled={disabled || !webgpuAvailable}
          role="radio"
          aria-checked={value === "webgpu"}
          className="flex-1 text-xs"
        >
          WebGPU (GPU)
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === "wasm" ? "default" : "outline"}
          onClick={() => onChange("wasm")}
          disabled={disabled}
          role="radio"
          aria-checked={value === "wasm"}
          className="flex-1 text-xs"
        >
          WASM (CPU)
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground" aria-live="polite">
        {webgpuAvailable === null && t.detectingHardware}
        {webgpuAvailable === true &&
          (autoDetected === "webgpu" ? t.webgpuAutoSelected : t.webgpuDetected)}
        {webgpuAvailable === false && t.webgpuNotAvailable}
      </p>
    </fieldset>
  );
}
