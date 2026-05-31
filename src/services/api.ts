import type { ExtractionRequest, ExtractionResponse } from "../types";

export const extractDocuments = async (payload: ExtractionRequest): Promise<ExtractionResponse> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || "Extraction request failed.");
  }

  return body as ExtractionResponse;
};
