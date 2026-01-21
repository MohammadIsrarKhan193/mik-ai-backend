import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

/* Fix __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */
app.use(cors());
app.use(express.json());

/* Serve frontend */
app.use(express.static(path.join(__dirname, "public")));

/* Health check (IMPORTANT for Render) */
app.get("/health", (req, res) => {
  res.json({ status: "MÎK AI backend running ✅" });
});

/* Placeholder chat endpoint (UI safe) */
app.post("/chat", (req, res) => {
  res.json({
    reply: "🧠 MÎK AI is waking up… (AI coming in next phase)"
  });
});

/* Fallback for SPA */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Start server */
app.listen(PORT, () => {
  console.log(`🚀 MÎK AI server running on port ${PORT}`);
});
