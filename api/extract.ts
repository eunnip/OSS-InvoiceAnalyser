import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ExtractionRequest, ExtractionResponse, Provider } from "../src/types";

interface ServerlessRequest {
  method?: string;
  body: unknown;
}

interface ServerlessResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ServerlessResponse;
  json(value: unknown): void;
}

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: process.env.DEFAULT_OPENAI_MODEL || "gpt-5.4-mini",
  anthropic: process.env.DEFAULT_ANTHROPIC_MODEL || "claude-haiku-4-5",
  gemini: process.env.DEFAULT_GEMINI_MODEL || "gemini-2.5-flash-lite",
};

const parseJsonish = (text: string) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    return { text: trimmed };
  }
};

const buildPrompt = ({ instruction, schema }: ExtractionRequest) => [
  "You are a precise document extraction engine.",
  "Follow the user's extraction instructions exactly.",
  "Return valid JSON only. Do not include markdown.",
  "",
  "Extraction instructions:",
  instruction,
  schema?.trim() ? `\nDesired JSON shape or schema:\n${schema}` : "",
].join("\n");

const requireKey = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
};

const extractWithOpenAI = async (payload: ExtractionRequest): Promise<ExtractionResponse> => {
  const model = payload.model || DEFAULT_MODELS.openai;
  const client = new OpenAI({ apiKey: requireKey("OPENAI_API_KEY") });
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: buildPrompt(payload) },
    ...payload.files.map((file) => ({
      type: "file" as const,
      file: {
        filename: file.name,
        file_data: `data:${file.mimeType};base64,${file.data}`,
      },
    })),
  ];

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content }],
  });

  const rawText = response.choices[0]?.message?.content || "{}";
  return { provider: "openai", model, rawText, result: parseJsonish(rawText) };
};

const extractWithAnthropic = async (payload: ExtractionRequest): Promise<ExtractionResponse> => {
  const model = payload.model || DEFAULT_MODELS.anthropic;
  const client = new Anthropic({ apiKey: requireKey("ANTHROPIC_API_KEY") });
  const content: Anthropic.MessageParam["content"] = [
    { type: "text", text: buildPrompt(payload) },
    ...payload.files.map((file) => ({
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: file.mimeType as "application/pdf",
        data: file.data,
      },
    })),
  ];

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    temperature: 0,
    messages: [{ role: "user", content }],
  });

  const rawText = response.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

  return { provider: "anthropic", model, rawText, result: parseJsonish(rawText) };
};

const extractWithGemini = async (payload: ExtractionRequest): Promise<ExtractionResponse> => {
  const model = payload.model || DEFAULT_MODELS.gemini;
  const client = new GoogleGenAI({ apiKey: requireKey("GEMINI_API_KEY") });
  const response = await client.models.generateContent({
    model,
    contents: {
      role: "user",
      parts: [
        { text: buildPrompt(payload) },
        ...payload.files.map((file) => ({
          inlineData: { data: file.data, mimeType: file.mimeType },
        })),
      ],
    },
    config: {
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 8192,
    },
  });

  const rawText = response.text || "{}";
  return { provider: "gemini", model, rawText, result: parseJsonish(rawText) };
};

const validatePayload = (payload: Partial<ExtractionRequest>): ExtractionRequest => {
  if (!payload.provider || !["openai", "anthropic", "gemini"].includes(payload.provider)) {
    throw new Error("Choose a valid provider: openai, anthropic, or gemini.");
  }

  if (!payload.instruction?.trim()) {
    throw new Error("Extraction instructions are required.");
  }

  if (!payload.files?.length) {
    throw new Error("Upload at least one document.");
  }

  return payload as ExtractionRequest;
};

export const extractHandler = async (req: ServerlessRequest, res: ServerlessResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const payload = validatePayload(req.body as Partial<ExtractionRequest>);
    const result =
      payload.provider === "openai"
        ? await extractWithOpenAI(payload)
        : payload.provider === "anthropic"
          ? await extractWithAnthropic(payload)
          : await extractWithGemini(payload);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Extraction failed.",
    });
  }
};

export default extractHandler;
