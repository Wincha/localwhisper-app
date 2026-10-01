"use client";

import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

interface ProgressBarProps {
  label: string;
  progress: number;
  detail?: string;
}

export default function ProgressBar({
  label,
  progress,
  detail,
}: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <Progress
        value={Math.min(100, progress)}
        aria-label={label}
        className="w-full"
      >
        <ProgressLabel className="text-xs text-muted-foreground">{label}</ProgressLabel>
        <ProgressValue className="text-xs" />
      </Progress>
      {detail && (
        <p className="text-[10px] text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}
