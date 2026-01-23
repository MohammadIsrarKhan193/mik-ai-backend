import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

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

/* AI Chat Endpoint */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.json({ reply: "❌ No message received." });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.json({ reply: "❌ AI key not configured." });
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are MÎK AI — a helpful, respectful, intelligent assistant. Help with education, religion, technology, daily life, and problem solving. Never be harmful."
            },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await groqResponse.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "🤖 MÎK AI couldn’t generate a response.";

    res.json({ reply });

  } catch (error) {
    console.error("AI Error:", error);
    res.json({
      reply: "⚠️ MÎK AI had a temporary issue. Please try again."
    });
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
