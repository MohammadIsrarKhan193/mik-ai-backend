// ============================================================
//  MÎK AI — index.js  (Node.js / Render Backend) v3.0
//  Google Auth + Groq AI + MongoDB
//  Built by Mohammad Israr Khan (Afghanistan) 🪐
//  NO Firebase Admin — uses google-auth-library instead
// ============================================================

const express          = require("express");
const cors             = require("cors");
const jwt              = require("jsonwebtoken");
const mongoose         = require("mongoose");
const Groq             = require("groq-sdk");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app          = express();
const PORT         = process.env.PORT || 3000;
const googleClient = new OAuth2Client();
const GOOGLE_CLIENT_ID = "382112001405-slhtdqlovsn068mstq6f7v5lu16q5bac.apps.googleusercontent.com";

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "*", methods: ["GET","POST","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());
app.use(express.static("public"));

// ── Groq ──────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── MongoDB ───────────────────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(e  => console.error("❌ MongoDB:", e.message));
}

// ── Schemas ───────────────────────────────────────────────────
const Chat = mongoose.model("Chat", new mongoose.Schema({
  uid:          { type: String, required: true, index: true },
  title:        { type: String, default: "New Chat" },
  mode:         { type: String, default: "general" },
  messages:     [{ role: { type: String, enum: ["user","assistant"] }, content: String, _id: false }],
  lastMessage:  String,
  messageCount: { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
}));

const UserStats = mongoose.model("UserStats", new mongoose.Schema({
  uid:           { type: String, required: true, unique: true },
  totalMessages: { type: Number, default: 0 },
  firstSeen:     { type: Date, default: Date.now },
  lastSeen:      { type: Date, default: Date.now },
}));

// ── JWT ───────────────────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET  || "mik-ai-secret-change-me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token." });
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Token invalid." }); }
}

// ── Health ────────────────────────────────────────────────────
app.get("/health", (_,res) => res.json({ status: "🪐 MÎK AI live", version: "3.0.0" }));

// ─────────────────────────────────────────────────────────────
//  POST /auth/google
//  Verifies Google Identity Services token → returns JWT
// ─────────────────────────────────────────────────────────────
app.post("/auth/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken required." });

  try {
    const ticket  = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const user = {
      uid:   payload.sub,
      name:  payload.name    || "MÎK User",
      email: payload.email   || "",
      photo: payload.picture || "",
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    if (mongoose.connection.readyState === 1) {
      await UserStats.findOneAndUpdate(
        { uid: user.uid },
        { $set: { lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } },
        { upsert: true }
      );
    }

    console.log("✅ Auth:", user.email);
    return res.json({ success: true, token, user });

  } catch(err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token: " + err.message });
  }
});

// ── GET /me ───────────────────────────────────────────────────
app.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

// ─────────────────────────────────────────────────────────────
//  POST /chat
// ─────────────────────────────────────────────────────────────
app.post("/chat", requireAuth, async (req, res) => {
  const { message, mode = "general", chatId, history = [], language = "english" } = req.body;
  if (!message) return res.status(400).json({ message: "message required." });

  const langNote = language !== "english" ? ` Always respond in ${language}.` : "";

  const systemPrompts = {
  general: `You are MÎK AI, a helpful and friendly assistant created by Mohammad Israr Khan (MÎK) from Afghanistan. Your creator's native languages are Pashto and Dari. You support Pashto, Dari, Persian, English, Urdu, Arabic and all other languages. Always be helpful, accurate and honest.${langNote}`,
  islamic: `You are MÎK AI in Islamic Mode. Answer questions about Islam with care and full accuracy. Cite Quran and Hadith where relevant. Start with Bismillah. Never give wrong Islamic information. Your creator is Mohammad Israr Khan from Afghanistan.${langNote}`,
  image: `You are MÎK AI. Help the user craft vivid image generation prompts. Be descriptive and creative.${langNote}`,
  quiz: `You are MÎK AI Quiz Master. Generate multiple-choice questions. Format: Question, A/B/C/D options, then correct answer.${langNote}`,
  teacher: `You are MÎK AI as a Teacher. Explain topics clearly with examples, step by step. Make learning easy and fun. Created by Mohammad Israr Khan from Afghanistan.${langNote}`,
  doctor: `You are MÎK AI as a medical assistant. Give helpful health information but always remind users to consult a real doctor. Never give wrong medical advice.${langNote}`,
  coder: `You are MÎK AI as a coding expert. Help with any programming language. Write clean code with explanations. Debug errors efficiently.${langNote}`,
  lawyer: `You are MÎK AI as a legal assistant. Provide general legal information but remind users to consult a real lawyer for legal advice.${langNote}`,
};

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompts[mode] || systemPrompts.general },
        ...history.slice(-10),
        { role: "user", content: message },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No response.";

    let savedChatId = chatId;
    if (mongoose.connection.readyState === 1) {
      let chat = chatId ? await Chat.findOne({ _id: chatId, uid: req.user.uid }) : null;
      if (!chat) chat = new Chat({ uid: req.user.uid, mode, title: message.slice(0, 60) });
      chat.messages.push({ role: "user",      content: message });
      chat.messages.push({ role: "assistant", content: reply   });
      chat.lastMessage  = reply.slice(0, 100);
      chat.messageCount = chat.messages.length;
      chat.updatedAt    = new Date();
      await chat.save();
      savedChatId = chat._id;
      await UserStats.findOneAndUpdate(
        { uid: req.user.uid },
        { $inc: { totalMessages: 1 }, $set: { lastSeen: new Date() } }
      );
    }

    return res.json({ reply, chatId: savedChatId });
  } catch(err) {
    console.error("Groq error:", err.message);
    return res.status(500).json({ message: "AI error. Try again." });
  }
});

// ── GET /history ──────────────────────────────────────────────
app.get("/history", requireAuth, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ history: [], stats: { totalChats: 0, totalMessages: 0, daysActive: 1 } });
  }
  try {
    const [history, stats] = await Promise.all([
      Chat.find({ uid: req.user.uid }).sort({ updatedAt: -1 }).limit(50).select("-messages"),
      UserStats.findOne({ uid: req.user.uid }),
    ]);
    const daysActive = stats?.firstSeen
      ? Math.max(1, Math.ceil((Date.now() - new Date(stats.firstSeen)) / 86400000)) : 1;
    return res.json({ history, stats: { totalChats: history.length, totalMessages: stats?.totalMessages || 0, daysActive } });
  } catch(err) { return res.status(500).json({ message: err.message }); }
});

// ── GET /history/:id ──────────────────────────────────────────
app.get("/history/:id", requireAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, uid: req.user.uid });
    if (!chat) return res.status(404).json({ message: "Not found." });
    return res.json({ chat });
  } catch(err) { return res.status(500).json({ message: err.message }); }
});

// ── DELETE /history/:id ───────────────────────────────────────
app.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, uid: req.user.uid });
    return res.json({ success: true });
  } catch(err) { return res.status(500).json({ message: err.message }); }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🪐 MÎK AI backend on port ${PORT}`));
