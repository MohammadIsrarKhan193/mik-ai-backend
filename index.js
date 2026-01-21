import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

/* Fix __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */
app.use(cors());
app.use(express.json());

/* Serve frontend */
app.use(express.static(path.join(__dirname, "public")));

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "MÎK AI backend running ✅" });
});

/* CHAT API */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "❌ Empty message received." });
    }

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are MÎK AI, smart, calm, helpful." },
            { role: "user", content: userMessage }
          ]
        })
      }
    );

    const data = await groqRes.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "🤖 MÎK AI couldn’t think properly. Try again.";

    res.json({ reply });
  } catch (err) {
    console.error("Groq error:", err);
    res.json({
      reply: "🤖 MÎK AI couldn’t think properly. Try again."
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
