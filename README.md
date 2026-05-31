# Open Invoice Analyser

Open Invoice Analyser is an open-source document extraction tool inspired by the original Ultimate Invoice Analyser. Instead of hard-coded accounting definitions, it lets you describe what you want extracted and optionally provide the JSON shape you want back.

It supports multiple AI providers:

- OpenAI
- Claude / Anthropic
- Gemini / Google

## Features

- Upload one or more PDF/image documents.
- Choose provider and model at runtime.
- Write custom extraction instructions for invoices, receipts, contracts, purchase orders, or any structured document.
- Provide a JSON shape/schema to guide the response.
- Download extracted JSON.
- Runs locally with Vite and a small Express API.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run api
npm run dev
```

Open `http://localhost:3000`.

Set at least one provider key in `.env.local`:

```bash
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

## Development

Run the API and frontend in separate terminals:

```bash
npm run api
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Provider Notes

OpenAI, Anthropic, and Gemini handle document inputs differently. PDFs are the primary target. Image support is provider-dependent and may require model changes as each provider evolves.

## Project Direction

The old analyser encoded a fixed asset/accounting policy directly into the extraction prompt and schema. This version keeps the useful invoice workflow but makes extraction fully user-directed:

- "Extract fixed asset fields for my accounting workflow."
- "Extract warranty dates and serial numbers."
- "Extract all subscription periods and renewal terms."
- "Extract supplier, ABN, GST, totals, and line items."

## License

MIT
