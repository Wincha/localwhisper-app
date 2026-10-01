# LocalWhisper.app

> Free, private audio & video transcription powered by OpenAI Whisper — 100% in your browser.

LocalWhisper.app transcribes audio and video files **locally on your device** using [Whisper](https://github.com/openai/whisper) models running through [🤗 Transformers.js](https://github.com/huggingface/transformers.js). Your files are never uploaded anywhere: decoding, audio extraction and speech recognition all happen client-side, accelerated with **WebGPU** when available and falling back to **WASM (CPU)** otherwise.

Repository: <https://github.com/Wincha/localwhisper-app>

## Features

- **100% local & private** — no server, no uploads, no data collection.
- **WebGPU acceleration** with automatic hardware detection and WASM (CPU) fallback.
- **8 Whisper models**, from Tiny (~75 MB) to Large V3 Turbo (~1.6 GB), multilingual and English-only variants.
- **Audio & video input** — MP3, WAV, OGG, FLAC, M4A, MP4, WebM, MKV, AVI, MOV… Audio is extracted from video with [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).
- **Language auto-detection** or manual language selection.
- **Export** as plain text (`.txt`), SubRip (`.srt`) or WebVTT (`.vtt`), or copy to clipboard.
- **Soft subtitles** — embed the generated subtitles into the original video as a toggleable track (not burned in).
- **Subtitle muxer** — add any existing `.srt` / `.vtt` file to a video.
- **13 UI languages** — English, Español, Français, Deutsch, Italiano, Português, 日本語, 中文, 한국어, Русский, Català, Nederlands, العربية.

## Models

| Model | Size | Languages |
| --- | --- | --- |
| Tiny | ~75 MB | Multilingual / English only |
| Base | ~145 MB | Multilingual / English only |
| Small | ~470 MB | Multilingual / English only |
| Medium | ~1.5 GB | Multilingual |
| Large V3 Turbo | ~1.6 GB | Multilingual |

Models are the ONNX conversions published by [`onnx-community`](https://huggingface.co/onnx-community) on the Hugging Face Hub. They are downloaded once on first use and cached by the browser. WebGPU runs the models in `fp32`; WASM uses `q8` quantized weights.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI)
- [@huggingface/transformers](https://github.com/huggingface/transformers.js) — Whisper inference (WebGPU / WASM)
- [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) — audio extraction and subtitle muxing

## Getting started

### Requirements

- Node.js 20+ and npm
- A modern browser. WebGPU (Chrome / Edge 113+) is recommended for speed; other browsers use the WASM backend.

### Install & run

```bash
git clone https://github.com/Wincha/localwhisper-app.git
cd localwhisper-app
npm install
npm run dev
```

Open <http://localhost:3000> in your browser.

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build (run `npm run build` first) |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout, metadata, fonts
│   ├── page.tsx              # Main page (Transcribe / Add subtitles tabs)
│   └── globals.css
├── components/
│   ├── Transcriber.tsx       # Transcription flow
│   ├── SubtitleMuxer.tsx     # Standalone subtitle muxer
│   ├── TranscriptionOutput.tsx
│   ├── ModelSelector.tsx
│   ├── BackendSelector.tsx
│   ├── LocaleSwitcher.tsx
│   ├── Header.tsx / Footer.tsx
│   └── ui/                   # shadcn/ui components
└── lib/
    ├── whisper.ts            # Model list, WebGPU detection, transcription pipeline
    ├── ffmpeg.ts             # FFmpeg.wasm: audio extraction & subtitle muxing
    ├── formats.ts            # SRT / VTT generation and downloads
    ├── i18n.ts               # UI translations
    └── i18n-context.tsx      # Locale provider
```

## Deployment

FFmpeg.wasm needs `SharedArrayBuffer`, which requires the page to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated). `next.config.ts` already sends these headers on every route:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Make sure your hosting platform preserves them (Vercel and any Node.js host running `next start` will). If you serve a static export, configure the same headers on your web server or CDN.

## Privacy

Everything runs in the browser. The only network requests are to download the Whisper model weights (Hugging Face Hub) and the FFmpeg core (unpkg) — your audio, video and transcriptions never leave your device.

## Author

Made by **Dj'Wincha** — [github.com/Wincha](https://github.com/Wincha)
