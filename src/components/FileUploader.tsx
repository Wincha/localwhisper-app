"use client";

import { useI18n } from "@/lib/i18n-context";
import DropZone from "./DropZone";

interface FileUploaderProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT =
  "audio/*,video/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.mp4,.webm,.mkv,.avi,.mov";

export default function FileUploader({ onFile, disabled }: FileUploaderProps) {
  const { t } = useI18n();

  return (
    <DropZone
      label={t.dropFileHere}
      detail={t.supportedFormats}
      accept={ACCEPT}
      onFile={onFile}
      disabled={disabled}
    />
  );
}
