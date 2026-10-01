export interface TimedChunk {
  timestamp: [number, number | null];
  text: string;
}

function formatTime(seconds: number, useDot = false): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  const sep = useDot ? "." : ",";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(ms).padStart(3, "0")}`;
}

export function toSRT(chunks: TimedChunk[]): string {
  return chunks
    .map((chunk, i) => {
      const start = formatTime(chunk.timestamp[0]);
      const end = formatTime(chunk.timestamp[1] ?? chunk.timestamp[0] + 5);
      return `${i + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n`;
    })
    .join("\n");
}

export function toVTT(chunks: TimedChunk[]): string {
  const lines = chunks.map((chunk) => {
    const start = formatTime(chunk.timestamp[0], true);
    const end = formatTime(
      chunk.timestamp[1] ?? chunk.timestamp[0] + 5,
      true
    );
    return `${start} --> ${end}\n${chunk.text.trim()}`;
  });
  return `WEBVTT\n\n${lines.join("\n\n")}\n`;
}

export function downloadFile(content: string, filename: string): void {
  downloadBlob(new Blob([content], { type: "text/plain;charset=utf-8" }), filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
