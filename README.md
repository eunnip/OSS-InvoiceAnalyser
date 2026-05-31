# Open Invoice Analyser

Open Invoice Analyser is an open-source document extraction tool inspired by the original Ultimate Invoice Analyser. Instead of hard-coded accounting definitions, it lets you describe what you want extracted and optionally provide the JSON shape you want back.

It supports multiple AI providers:

- OpenAI
- Claude / Anthropic
- Gemini / Google

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/eunnip/OSS-InvoiceAnalyser&env=OPENAI_API_KEY,ANTHROPIC_API_KEY,GEMINI_API_KEY&envDescription=Add%20at%20least%20one%20provider%20API%20key.%20Only%20providers%20with%20configured%20keys%20will%20work.&project-name=open-invoice-analyser&repository-name=open-invoice-analyser)

## Features

- Upload one or more PDF/image documents.
- Choose provider and model at runtime.
- Write custom extraction instructions for invoices, receipts, contracts, purchase orders, or any structured document.
- Provide a JSON shape/schema to guide the response.
- Download extracted JSON.
- Runs locally with Vite and a small Express API.
- Deploys as a Vite static app plus `/api/extract` serverless function on Vercel.

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

Preview the production build:

```bash
npm start
```

## Deploy to Vercel

Fork this repository, then import it into Vercel or use the deploy button above.

Vercel should detect the app automatically. The repo also includes `vercel.json` with these defaults:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Serverless API: `api/extract.ts`

Add environment variables in Vercel Project Settings:

```bash
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

Only the providers with configured API keys will work. For example, a fork can deploy with just `OPENAI_API_KEY` if it only needs OpenAI.

Optional model defaults:

```bash
DEFAULT_OPENAI_MODEL=gpt-4.1-mini
DEFAULT_ANTHROPIC_MODEL=claude-3-5-sonnet-latest
DEFAULT_GEMINI_MODEL=gemini-2.5-flash
```

## Deploy Elsewhere

Any host that supports a Vite static frontend and Node serverless functions can run this project:

- Build the frontend with `npm run build`.
- Serve the `dist` directory.
- Route `POST /api/extract` to `api/extract.ts`.
- Set at least one provider API key in the hosting environment.

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
