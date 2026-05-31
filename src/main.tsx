import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, FileJson, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { DEFAULT_INSTRUCTION, DEFAULT_SCHEMA, MODELS } from "./defaults";
import { extractDocuments } from "./services/api";
import { downloadJson, fileToBase64 } from "./services/fileUtils";
import type { ExtractionResponse, Provider, UploadedFile } from "./types";
import "./styles.css";

const PROVIDERS: Array<{ id: Provider; label: string }> = [
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Claude" },
  { id: "gemini", label: "Gemini" },
];

const App = () => {
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<string>(MODELS.openai[0]);
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedResult = useMemo(() => {
    if (!result) {
      return "";
    }

    return JSON.stringify(result.result, null, 2);
  }, [result]);

  const handleProviderChange = (nextProvider: Provider) => {
    setProvider(nextProvider);
    setModel(MODELS[nextProvider][0]);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      return;
    }

    const uploadedFiles = await Promise.all(Array.from(fileList).map(fileToBase64));
    setFiles((current) => [...current, ...uploadedFiles]);
  };

  const runExtraction = async () => {
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await extractDocuments({
        provider,
        model,
        instruction,
        schema,
        files,
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Extraction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Open Invoice Analyser</h1>
            <p>Extract any fields from invoices, receipts, contracts, and PDFs with your preferred AI provider.</p>
          </div>
          <button
            className="primary-action"
            onClick={runExtraction}
            disabled={isLoading || !files.length || !instruction.trim()}
          >
            {isLoading ? <Loader2 className="spin" size={18} /> : <FileJson size={18} />}
            Extract JSON
          </button>
        </header>

        <div className="panel-grid">
          <section className="tool-panel">
            <div className="section-title">
              <span>Provider</span>
            </div>
            <div className="segmented-control">
              {PROVIDERS.map((item) => (
                <button
                  key={item.id}
                  className={provider === item.id ? "selected" : ""}
                  onClick={() => handleProviderChange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="field">
              <span>Model</span>
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                {MODELS[provider].map((modelName) => (
                  <option key={modelName} value={modelName}>
                    {modelName}
                  </option>
                ))}
              </select>
            </label>

            <label className="upload-zone">
              <UploadCloud size={28} />
              <strong>Upload documents</strong>
              <span>PDFs and images work best. Multiple files are sent together.</span>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </label>

            <div className="file-list">
              {files.map((file) => (
                <div className="file-row" key={file.id}>
                  <span>{file.name}</span>
                  <button
                    aria-label={`Remove ${file.name}`}
                    onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!files.length && <p className="empty-copy">No documents selected.</p>}
            </div>
          </section>

          <section className="editor-panel">
            <label className="field fill">
              <span>What should be extracted?</span>
              <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} />
            </label>

            <label className="field fill">
              <span>JSON shape or schema</span>
              <textarea value={schema} onChange={(event) => setSchema(event.target.value)} />
            </label>
          </section>

          <section className="result-panel">
            <div className="result-header">
              <div>
                <span className="section-title">Result</span>
                {result && <small>{result.provider} · {result.model}</small>}
              </div>
              <button className="icon-button" onClick={() => downloadJson(result?.result)} disabled={!result}>
                <Download size={18} />
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}
            {!error && !result && (
              <div className="empty-state">
                <Plus size={22} />
                <span>Run an extraction to see structured JSON here.</span>
              </div>
            )}
            {result && <pre>{formattedResult}</pre>}
          </section>
        </div>
      </section>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
