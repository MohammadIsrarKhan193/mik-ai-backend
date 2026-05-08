/* ═══════════════════════════════════════════════
   MÎK AI — index.js v3.0 🪐
   By Mohammad Israr Khan
═══════════════════════════════════════════════ */

import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import { config } from "dotenv";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
config();

const app = express();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mik-ai-secret-2026";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ── Firebase Admin Init ───────────────────────
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim().startsWith("{")) {
    const serviceAccount = JSON.parse(
      raw.replace(/\\n/g, "\n")
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase initialized successfully!");
  } else {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT is missing or invalid!");
  }
} catch(e) {
  console.error("❌ Firebase init error:", e.message);
}

// ── Groq Init ─────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const chatHistory = {};

// ── System Prompts ────────────────────────────
const GENERAL_PROMPT = `You are MÎK AI 🪐 — a powerful, cosmic AI assistant created by Mohammad Israr Khan (MÎK). You are smart, helpful, friendly, and cosmic in personality.
IMPORTANT: Always reply in the SAME language the user writes in. Auto-detect and match language every time.
Help with anything: coding, writing, ideas, analysis, and more.`;

const ISLAMIC_PROMPT = `You are MÎK AI 🪐 in Islamic Mode — a knowledgeable Islamic assistant created by Mohammad Israr Khan (MÎK).
IMPORTANT: Always reply in the SAME language the user writes in. Auto-detect and match language every time.
You specialize in Quran tafsir, Hadith, Fiqh, Islamic history, duas, and practical Islamic guidance. Use Islamic etiquette naturally. Always recommend consulting a qualified scholar for personal fatwas.`;

const QUIZ_PROMPT = `You are MÎK AI 🪐 in Quiz Mode. Generate a fun quiz question with 4 options (A, B, C, D).
Format EXACTLY like this:
QUESTION: [question]
A) [option]
B) [option]
C) [option]
D) [option]
ANSWER: [correct letter]
EXPLANATION: [brief explanation]`;

const VOICE_PROMPT = `You are MÎK AI in voice mode. Give SHORT conversational answers. Max 2-3 sentences. No markdown, no bullets, no emojis. Natural speech only. Match user language.`;

// ── Keywords ──────────────────────────────────
const IMAGE_KEYWORDS = ["create", "generate", "draw", "imagine", "picture", "image", "pic", "design", "paint", "بنا", "تصویر", "جنریٹ"];
const LOGO_KEYWORDS  = ["icon", "logo", "app icon", "brand", "symbol", "badge"];
const isImageRequest = (t) => IMAGE_KEYWORDS.some(k => t.toLowerCase().includes(k));
const isLogoRequest  = (t) => LOGO_KEYWORDS.some(k => t.toLowerCase().includes(k));

// ── Auth Middleware ───────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token." });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid or expired." });
  }
}

// ── POST /auth/google ─────────────────────────
app.post("/auth/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken required." });
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = {
      uid:   decoded.uid,
      name:  decoded.name    || "MÎK User",
      email: decoded.email   || "",
      photo: decoded.picture || "",
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    console.log(`✅ User signed in: ${user.email}`);
    res.json({ success: true, token, user });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ── GET /me ───────────────────────────────────
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /chat ────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, userId, mode } = req.body;
    if (!message?.trim()) return res.status(400).json({ reply: "Please send a valid message." });

    const id = userId || "guest";
    const trimmed = message.trim();

    // Image generation
    if (isImageRequest(trimmed) || mode === "imagine") {
      if (isLogoRequest(trimmed)) {
        return res.json({ reply: `I can't generate logos accurately! 🪐\n\nTry:\n- **[Canva.com](https://canva.com)** — free & easy\n- **[Looka.com](https://looka.com)** — AI logo maker` });
      }
      const encodedPrompt = encodeURIComponent(trimmed);
      return res.json({ reply: `IMAGE_GEN:/generate-image?prompt=${encodedPrompt}` });
    }

    // Quiz mode
    if (mode === "quiz") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: QUIZ_PROMPT }, { role: "user", content: trimmed }],
        temperature: 0.8, max_tokens: 300
      });
      return res.json({ reply: completion.choices[0]?.message?.content, type: "quiz" });
    }

    // Normal chat
    if (!chatHistory[id]) chatHistory[id] = [];
    const systemPrompt = mode === "islamic" ? ISLAMIC_PROMPT : GENERAL_PROMPT;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...chatHistory[id], { role: "user", content: trimmed }],
      temperature: 0.7, max_tokens: 1024
    });
    const reply = completion.choices[0]?.message?.content || "No response.";
    chatHistory[id].push({ role: "user", content: trimmed }, { role: "assistant", content: reply });
    if (chatHistory[id].length > 20) chatHistory[id] = chatHistory[id].slice(-20);
    res.json({ reply });

  } catch (error) {
    console.error("MÎK AI Error:", error?.message);
    res.status(500).json({ reply: "MÎK AI is busy! Try again 🪐" });
  }
});

// ── GET /generate-image ───────────────────────
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
    res.status(500).json({ error: "Image generation failed" });
  }
});

// ── POST /speak ───────────────────────────────
app.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text" });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: VOICE_PROMPT }, { role: "user", content: text }],
      max_tokens: 150, temperature: 0.7
    });
    res.json({ reply: completion.choices[0]?.message?.content });
  } catch (e) {
    res.status(500).json({ error: "Voice error" });
  }
});

// ── POST /upload ──────────────────────────────
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const isImage = req.file.mimetype.startsWith("image/");
    const aiComment = isImage
      ? `I can see you uploaded: **${req.file.originalname}** Masha'Allah! 🪐`
      : `File received: **${req.file.originalname}** (${(req.file.size/1024).toFixed(1)}KB) 🪐`;
    res.json({ fileUrl: `/uploads/${req.file.filename}`, aiComment });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// ── POST /quiz ────────────────────────────────
app.post("/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: QUIZ_PROMPT }, { role: "user", content: `Quiz about: ${topic || "general knowledge"}` }],
      temperature: 0.8, max_tokens: 300
    });
    res.json({ quiz: completion.choices[0]?.message?.content });
  } catch (e) {
    res.status(500).json({ error: "Quiz failed" });
  }
});

// ── GET /health ───────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "online", name: "MÎK AI 🪐", version: "3.0" });
});

// ── Start ─────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 MÎK AI v3.0 online — Port ${PORT}`));
