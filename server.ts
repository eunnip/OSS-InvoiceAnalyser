import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractHandler } from "./api/extract";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.post("/api/extract", extractHandler);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res
      .status(200)
      .send("Open Invoice Analyser API is running. Run `npm run dev` for the frontend or `npm run build` before `npm start`.");
  });
}

app.listen(port, () => {
  console.log(`Open Invoice Analyser listening on http://localhost:${port}`);
});
