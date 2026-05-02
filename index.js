/* ═══════════════════════════════════════════════
   MÎK AI — index.js v2.1 🪐
   By Mohammad Israr Khan
═══════════════════════════════════════════════ */

import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import { config } from "dotenv";
config();

const app = express();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const chatHistory = {};

// ─── System Prompts ──────────────────────────────
const GENERAL_PROMPT = `You are MÎK AI 🪐 — a powerful, cosmic AI assistant created by Mohammad Israr Khan (MÎK). You are smart, helpful, friendly, and cosmic in personality.

IMPORTANT: Always reply in the SAME language the user writes in. If they write in Urdu reply in Urdu. If Pashto reply in Pashto. If Arabic reply in Arabic. If English reply in English. If Dari reply in Dari. Auto-detect and match the user language every time.

Help with anything: coding, writing, ideas, analysis, and more. Keep responses clear and useful.`;

const ISLAMIC_PROMPT = `You are MÎK AI 🪐 in Islamic Mode — a knowledgeable Islamic assistant created by Mohammad Israr Khan (MÎK).

IMPORTANT: Always reply in the SAME language the user writes in. Auto-detect and match language every time.

You specialize in Quran tafsir, Hadith, Fiqh, Islamic history, duas, and practical Islamic guidance. Use Islamic etiquette naturally — Bismillah, Insha'Allah, Alhamdulillah, Masha'Allah. Always recommend consulting a qualified scholar for personal fatwas. Be warm, humble, and knowledgeable.`;

const QUIZ_PROMPT = `You are MÎK AI 🪐 in Quiz Mode. Generate a fun quiz question with 4 options (A, B, C, D) and indicate the correct answer. Format your response EXACTLY like this:
QUESTION: [question here]
A) [option]
B) [option]
C) [option]
D) [option]
ANSWER: [correct letter]
EXPLANATION: [brief explanation]`;

const VOICE_PROMPT = `You are MÎK AI in voice mode. Give SHORT, conversational spoken answers. Max 2-3 sentences. No markdown, no bullet points, no emojis. Just natural speech. Match the language the user spoke in.`;

// ─── Image Keywords ──────────────────────────────
const IMAGE_KEYWORDS = ["create", "generate", "draw", "imagine", "picture", "image", "pic", "design", "make a photo", "paint", "بنا", "تصویر", "جنریٹ"];
const isImageRequest = (text) => IMAGE_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

// ─── Main Chat Route ─────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, userId, mode } = req.body;
    if (!message || typeof message !== "string" || !message.trim())
      return res.status(400).json({ reply: "Please send a valid message." });

    const id = userId || "guest";
    const trimmed = message.trim();

    // 🎨 Image Generation
    if (isImageRequest(trimmed) || mode === "imagine") {
      const encodedPrompt = encodeURIComponent(trimmed);
      return res.json({
        reply: `IMAGE_GEN:/generate-image?prompt=${encodedPrompt}`
      });
    }

    // 📝 Quiz Mode
    if (mode === "quiz") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: QUIZ_PROMPT },
          { role: "user", content: trimmed }
        ],
        temperature: 0.8,
        max_tokens: 300
      });
      return res.json({ reply: completion.choices[0]?.message?.content, type: "quiz" });
    }

    // 💬 Normal Chat
    if (!chatHistory[id]) chatHistory[id] = [];
    const systemPrompt = mode === "islamic" ? ISLAMIC_PROMPT : GENERAL_PROMPT;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory[id],
        { role: "user", content: trimmed }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const reply = completion.choices[0]?.message?.content || "No response received.";
    chatHistory[id].push({ role: "user", content: trimmed }, { role: "assistant", content: reply });
    if (chatHistory[id].length > 20) chatHistory[id] = chatHistory[id].slice(-20);

    res.json({ reply });
  } catch (error) {
    console.error("MÎK AI Error:", error?.message || error);
    res.status(500).json({ reply: "MÎK AI is busy right now. Please try again! 🪐" });
  }
});

// ─── Image Generation Route ───────────────────────
app.get("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.query;
    if (!prompt) return res.status(400).json({ error: "No prompt" });

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 9999)}&nologo=true&enhance=true`;

    const response = await fetch(imageUrl, { timeout: 30000 });
    if (!response.ok) throw new Error("Image fetch failed");

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.body.pipe(res);

  } catch (e) {
    console.error("Image error:", e.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

// ─── Voice Route ──────────────────────────────────
app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: VOICE_PROMPT },
        { role: "user", content: text }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I didn't catch that.";
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Voice error" });
  }
});

// ─── File Upload Route ────────────────────────────
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const isImage = mimeType.startsWith("image/");
    const fileUrl = `/uploads/${req.file.filename}`;

    const aiComment = isImage
      ? `I can see you uploaded an image: **${originalName}**. Masha'Allah! 🪐`
      : `File received: **${originalName}** (${(req.file.size / 1024).toFixed(1)} KB). 🪐`;

    res.json({ fileUrl, originalName, mimeType, isImage, aiComment });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// ─── Quiz Route ───────────────────────────────────
app.post("/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: QUIZ_PROMPT },
        { role: "user", content: `Generate a quiz question about: ${topic || "general knowledge"}` }
      ],
      temperature: 0.8,
      max_tokens: 300
    });
    res.json({ quiz: completion.choices[0]?.message?.content });
  } catch (e) {
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

// ─── Health Check ─────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "online", name: "MÎK AI Backend 🪐", version: "2.1" });
});

// ─── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Backend online — Port ${PORT}`));
