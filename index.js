import express from "express";
import cors from "cors";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* Fix __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "MÎK AI backend running ✅" });
});

/* 🔥 REAL AI CHAT ENDPOINT */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ reply: "⚠️ Empty message" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are MÎK AI — a helpful, friendly, professional assistant created by Mohammad Israr (MÎK)."
            },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "🤖 MÎK AI couldn’t think properly. Try again.";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "⚠️ Server busy. Please retry." });
  }
});

/* SPA fallback */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Start server */
app.listen(PORT, () => {
  console.log(`🚀 MÎK AI running on port ${PORT}`);
});
