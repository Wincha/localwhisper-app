import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => onProgress(progress));
  }

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    ),
  });

  return ffmpeg;
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.substring(dot) : ".mp4";
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export async function extractAudioAsWav(
  videoFile: File,
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg(onProgress);

  const inputName = "input" + getExtension(videoFile.name);
  const outputName = "output.wav";

  await ff.writeFile(inputName, await fetchFile(videoFile));

  await ff.exec([
    "-i",
    inputName,
    "-vn",
    "-ar",
    "16000",
    "-ac",
    "1",
    "-f",
    "wav",
    outputName,
  ]);

  const data = await ff.readFile(outputName);

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return new Blob([data as BlobPart], { type: "audio/wav" });
}

export async function muxSubtitles(
  videoFile: File,
  srtContent: string,
  onProgress?: (ratio: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg(onProgress);

  const ext = getExtension(videoFile.name);
  const inputName = "input" + ext;
  const subsName = "subs.srt";
  const outputName = "output" + ext;

  await ff.writeFile(inputName, await fetchFile(videoFile));
  await ff.writeFile(subsName, new TextEncoder().encode(srtContent));

  // Mux: copy video+audio streams, add subtitle track (soft subs)
  // mov_text for mp4/mov, srt for mkv/webm
  const subCodec = ext === ".mkv" || ext === ".webm" ? "srt" : "mov_text";

  await ff.exec([
    "-i", inputName,
    "-i", subsName,
    "-c", "copy",
    "-c:s", subCodec,
    "-map", "0:v",
    "-map", "0:a?",
    "-map", "1:0",
    "-metadata:s:s:0", "language=und",
    outputName,
  ]);

  const data = await ff.readFile(outputName);

  await ff.deleteFile(inputName);
  await ff.deleteFile(subsName);
  await ff.deleteFile(outputName);

  const mimeMap: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
  };

  return new Blob([data as BlobPart], { type: mimeMap[ext] || "video/mp4" });
}
