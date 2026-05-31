export const DEFAULT_INSTRUCTION = `Extract the information I ask for from the attached invoice or document.

Return clean JSON only. Preserve source wording where useful. If a value is not present, use null. Include evidence snippets for important fields.`;

export const DEFAULT_SCHEMA = `{
  "supplier": "string | null",
  "invoiceNumber": "string | null",
  "invoiceDate": "YYYY-MM-DD | null",
  "dueDate": "YYYY-MM-DD | null",
  "currency": "string | null",
  "totalAmount": "number | null",
  "taxAmount": "number | null",
  "lineItems": [
    {
      "description": "string",
      "quantity": "number | null",
      "unitPrice": "number | null",
      "total": "number | null"
    }
  ],
  "notes": ["string"]
}`;

export const MODELS = {
  openai: ["gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.4", "gpt-4.1-mini", "gpt-4o-mini"],
  anthropic: ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-sonnet-4-5"],
  gemini: ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash-preview"],
} as const;
