import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LocalWhisper.app — Free Local Audio & Video Transcription",
  description:
    "Transcribe audio and video files locally in your browser using OpenAI Whisper. No uploads, no cloud, 100% private. Supports WebGPU and WASM. Free and open source by Dj'Wincha.",
  keywords: [
    "whisper",
    "transcription",
    "speech to text",
    "local",
    "browser",
    "webgpu",
    "free",
    "private",
    "audio",
    "video",
    "subtitles",
    "srt",
  ],
  openGraph: {
    title: "LocalWhisper.app — Free Local Transcription",
    description:
      "Transcribe audio & video locally in your browser with OpenAI Whisper. No cloud, 100% private.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body suppressHydrationWarning className="h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
