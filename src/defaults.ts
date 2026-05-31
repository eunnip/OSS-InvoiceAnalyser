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
  openai: ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"],
  anthropic: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash"],
} as const;
