const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const chatHistory = {};

// ─── System Prompts ───────────────────────────────────────────
const GENERAL_PROMPT = `You are MÎK AI 🪐 — a powerful, cosmic AI assistant created by Mohammad Israr Khan (MÎK). You are smart, helpful, friendly, and a little cosmic in personality. Help with anything: coding, writing, ideas, analysis, and more. Keep responses clear and useful.`;

const ISLAMIC_PROMPT = `You are MÎK AI 🪐 in Islamic Mode — a knowledgeable Islamic assistant created by Mohammad Israr Khan (MÎK). You specialize in Quran tafsir, Hadith, Fiqh, Islamic history, duas, and practical Islamic guidance. Use Islamic etiquette naturally — Bismillah, Insha'Allah, Alhamdulillah, Masha'Allah. Always recommend consulting a qualified scholar for personal fatwas. Be warm, humble, and knowledgeable.`;

// ─── Image Keywords ───────────────────────────────────────────
const IMAGE_KEYWORDS = ["create", "generate", "draw", "imagine", "picture", "image", "pic", "design", "make a photo"];

const isImageRequest = (text) =>
  IMAGE_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

// ─── Chat Route ───────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, userId, mode } = req.body;

    // Input validation
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ reply: "Please send a valid message." });
    }

    const id = userId || "guest";
    const trimmed = message.trim();

    // 🎨 Image Generation
    if (isImageRequest(trimmed)) {
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(trimmed)}?width=512&height=512&seed=${Math.floor(Math.random() * 9999)}&nologo=true`;
      return res.json({ reply: `IMAGE_GEN:${imageUrl}` });
    }

    // 💬 Text Chat
    if (!chatHistory[id]) chatHistory[id] = [];

    const systemPrompt = mode === "islamic" ? ISLAMIC_PROMPT : GENERAL_PROMPT;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory[id],
        { role: "user", content: trimmed },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "No response received.";

    // Save to memory (keep last 10 exchanges = 20 messages)
    chatHistory[id].push(
      { role: "user", content: trimmed },
      { role: "assistant", content: reply }
    );
    if (chatHistory[id].length > 20) chatHistory[id] = chatHistory[id].slice(-20);

    res.json({ reply });

  } catch (error) {
    console.error("MÎK AI Error:", error?.message || error);
    res.status(500).json({ reply: "MÎK AI is busy right now. Please try again! 🪐" });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "online", name: "MÎK AI Backend 🪐" });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Backend online — Port ${PORT}`));
