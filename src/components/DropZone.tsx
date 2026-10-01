"use client";

import { useCallback, useState, useRef } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Card } from "@/components/ui/card";

interface DropZoneProps {
  label: string;
  accept: string;
  detail?: string;
  file?: File | null;
  fileName?: string | null;
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export default function DropZone({
  label,
  accept,
  detail,
  file,
  fileName: fileNameProp,
  onFile,
  disabled,
  className,
}: DropZoneProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);
  const [internalName, setInternalName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = fileNameProp ?? file?.name ?? internalName;

  const handleFile = useCallback(
    (f: File) => {
      setInternalName(f.name);
      onFile(f);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <Card
      size="sm"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={displayName ? `${displayName} — ${t.clickOrDropToReplace}` : label}
      aria-disabled={disabled}
      className={`cursor-pointer text-center transition-all duration-200 py-5 ${
        dragOver
          ? "ring-2 ring-primary bg-primary/10"
          : "hover:ring-1 hover:ring-primary/50 hover:bg-card/80"
      } ${disabled ? "opacity-50 pointer-events-none" : ""} ${className ?? ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {displayName ? (
        <div className="px-4">
          <p className="text-primary font-medium text-sm">{displayName}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {t.clickOrDropToReplace}
          </p>
        </div>
      ) : (
        <div className="px-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          {detail && (
            <p className="text-[10px] text-muted-foreground mt-1">{detail}</p>
          )}
        </div>
      )}
    </Card>
  );
}
