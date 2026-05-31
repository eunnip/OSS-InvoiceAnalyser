export type Provider = "openai" | "anthropic" | "gemini";

export interface ExtractionRequest {
  provider: Provider;
  model?: string;
  instruction: string;
  schema?: string;
  files: Array<{
    name: string;
    mimeType: string;
    data: string;
  }>;
}

export interface ExtractionResponse {
  provider: Provider;
  model: string;
  result: unknown;
  rawText?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string;
}
