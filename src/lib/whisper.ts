import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
  type ProgressInfo,
} from "@huggingface/transformers";

export type WhisperModel =
  | "tiny"
  | "tiny.en"
  | "base"
  | "base.en"
  | "small"
  | "small.en"
  | "medium"
  | "large-v3-turbo";

export type Backend = "webgpu" | "wasm";

export interface ModelInfo {
  id: string;
  nameKey: string;
  size: string;
  multilingual: boolean;
}

export const MODELS: Record<WhisperModel, ModelInfo> = {
  tiny: {
    id: "onnx-community/whisper-tiny",
    nameKey: "modelTiny",
    size: "~75 MB",
    multilingual: true,
  },
  "tiny.en": {
    id: "onnx-community/whisper-tiny.en",
    nameKey: "modelTinyEn",
    size: "~75 MB",
    multilingual: false,
  },
  base: {
    id: "onnx-community/whisper-base",
    nameKey: "modelBase",
    size: "~145 MB",
    multilingual: true,
  },
  "base.en": {
    id: "onnx-community/whisper-base.en",
    nameKey: "modelBaseEn",
    size: "~145 MB",
    multilingual: false,
  },
  small: {
    id: "onnx-community/whisper-small",
    nameKey: "modelSmall",
    size: "~470 MB",
    multilingual: true,
  },
  "small.en": {
    id: "onnx-community/whisper-small.en",
    nameKey: "modelSmallEn",
    size: "~470 MB",
    multilingual: false,
  },
  medium: {
    id: "onnx-community/whisper-medium",
    nameKey: "modelMedium",
    size: "~1.5 GB",
    multilingual: true,
  },
  "large-v3-turbo": {
    id: "onnx-community/whisper-large-v3-turbo",
    nameKey: "modelLargeTurbo",
    size: "~1.6 GB",
    multilingual: true,
  },
};

export async function detectWebGPU(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown | null> } };
  if (!nav.gpu) return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export interface TranscribeOptions {
  model: WhisperModel;
  backend: Backend;
  language?: string;
  timestamps?: boolean;
  onModelProgress?: (progress: ProgressInfo) => void;
  onTranscribeProgress?: (chunks: number) => void;
}

export interface TranscriptionResult {
  text: string;
  chunks?: Array<{ timestamp: [number, number | null]; text: string }>;
  duration: number;
  model: string;
  backend: Backend;
}

let cachedPipeline: AutomaticSpeechRecognitionPipeline | null = null;
let cachedModelId: string | null = null;
let cachedBackend: Backend | null = null;

export async function transcribe(
  audioData: Float32Array | string,
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  const modelInfo = MODELS[options.model];
  const modelId = modelInfo.id;

  if (
    !cachedPipeline ||
    cachedModelId !== modelId ||
    cachedBackend !== options.backend
  ) {
    cachedPipeline = null;
    cachedModelId = null;
    cachedBackend = null;

    const pipelineOptions: Record<string, unknown> = {
      device: options.backend,
      progress_callback: options.onModelProgress,
    };

    if (options.backend === "webgpu") {
      pipelineOptions.dtype = {
        encoder_model: "fp32",
        decoder_model_merged: "fp32",
      };
    } else {
      pipelineOptions.dtype = "q8";
    }

    cachedPipeline = (await pipeline(
      "automatic-speech-recognition",
      modelId,
      pipelineOptions
    )) as AutomaticSpeechRecognitionPipeline;
    cachedModelId = modelId;
    cachedBackend = options.backend;
  }

  const start = performance.now();

  const transcribeOptions: Record<string, unknown> = {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: options.timestamps ?? true,
  };

  if (options.language && modelInfo.multilingual) {
    transcribeOptions.language = options.language;
    transcribeOptions.task = "transcribe";
  }

  const result = await cachedPipeline(audioData, transcribeOptions);

  const duration = (performance.now() - start) / 1000;

  const output = Array.isArray(result) ? result[0] : result;

  return {
    text: output.text,
    chunks: output.chunks as
      | Array<{ timestamp: [number, number | null]; text: string }>
      | undefined,
    duration,
    model: modelInfo.nameKey,
    backend: options.backend,
  };
}

export function clearCache() {
  cachedPipeline = null;
  cachedModelId = null;
  cachedBackend = null;
}
