import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { extractHandler } from "./api/extract";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.post("/api/extract", extractHandler);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
