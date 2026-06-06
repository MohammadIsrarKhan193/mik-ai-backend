// ============================================================
//  MÎK AI — index.js  v4.0
//  Google Auth + Groq AI + MongoDB + Web Search
//  Built by Mohammad Israr Khan (Afghanistan) 🪐
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

app.use(cors({ origin: "*", methods: ["GET","POST","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(e  => console.error("❌ MongoDB:", e.message));
}

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

const JWT_SECRET  = process.env.JWT_SECRET  || "mik-ai-secret-change-me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token." });
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Token invalid." }); }
}

// ── Health ────────────────────────────────────────────────────
app.get("/health", (_,res) => res.json({ status: "🪐 MÎK AI live", version: "4.0.0" }));

// ── Web Search (DuckDuckGo - FREE) ────────────────────────────
async function webSearch(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(url);
    const data = await response.json();

    let results = [];

    // Abstract (main answer)
    if (data.AbstractText) {
      results.push(`📖 ${data.AbstractText}`);
    }

    // Related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics
        .filter(t => t.Text)
        .slice(0, 4)
        .map(t => `• ${t.Text}`);
      results = results.concat(topics);
    }

    // Answer
    if (data.Answer) {
      results.unshift(`✅ ${data.Answer}`);
    }

    if (results.length === 0) {
      return `No direct results found for "${query}". Here's what I know from my training:`;
    }

    return `🌐 Web Search Results for "${query}":\n\n${results.join('\n\n')}`;
  } catch (err) {
    console.error("Search error:", err.message);
    return null;
  }
}

// ── Auth ──────────────────────────────────────────────────────
app.post("/auth/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken required." });
  try {
    const ticket  = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
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

app.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

// ── Chat ──────────────────────────────────────────────────────
app.post("/chat", requireAuth, async (req, res) => {
  const { message, mode = "general", chatId, history = [], language = "english", imageBase64 } = req.body;
  if (!message) return res.status(400).json({ message: "message required." });

  const langNote = language !== "english" ? ` Always respond in ${language}.` : "";

  const systemPrompts = {
    general: `You are MÎK AI, a powerful and friendly AI assistant created by Mohammad Israr Khan (MÎK) from Afghanistan 🇦🇫. You are like ChatGPT but built in Afghanistan. Your creator's native languages are Pashto and Dari. You support all languages including Pashto, Dari, Persian, English, Urdu, Arabic. Always be helpful, accurate, honest and concise. Never give wrong information.${langNote}`,
    islamic: `You are MÎK AI in Islamic Mode. You are a knowledgeable Islamic assistant. Answer all questions about Islam with full accuracy. Always cite Quran (Surah and Ayah) and authentic Hadith where relevant. Start responses with Bismillah. Never give incorrect Islamic information. Be respectful and scholarly. Your creator is Mohammad Israr Khan from Afghanistan 🇦🇫.${langNote}`,
    image:   `You are MÎK AI. Help the user craft detailed, vivid image generation prompts. Make prompts descriptive with style, lighting, colors, and mood details.${langNote}`,
    quiz:    `You are MÎK AI Quiz Master. Generate engaging multiple-choice questions. Format: Question on its own line, then A) B) C) D) options each on their own line, then "Answer: X) ..." with explanation.${langNote}`,
    teacher: `You are MÎK AI as an expert Teacher. Explain any topic clearly with examples, analogies, and step-by-step breakdowns. Make learning easy, fun and memorable. Use emojis to make it engaging.${langNote}`,
    doctor:  `You are MÎK AI as a medical information assistant. Provide helpful, accurate health information. Always remind users to consult a real doctor for diagnosis and treatment. Never give wrong medical advice.${langNote}`,
    coder:   `You are MÎK AI as an expert software engineer. Help with any programming language or framework. Write clean, efficient, well-commented code. Debug errors thoroughly. Explain your solutions clearly.${langNote}`,
    lawyer:  `You are MÎK AI as a legal information assistant. Provide general legal information and explanations. Always remind users to consult a licensed lawyer for legal advice specific to their situation.${langNote}`,
    search:  `You are MÎK AI with web search capability. Analyze the search results provided and give a comprehensive, well-structured answer. Cite sources when available. Be accurate and helpful.${langNote}`,
  };

  try {
    let contextMessage = message;
    let useMode = mode;

    // Web search mode
    if (mode === 'search') {
      const searchResults = await webSearch(message);
      if (searchResults) {
        contextMessage = `${searchResults}\n\nBased on these search results, please provide a comprehensive answer to: "${message}"`;
      }
      useMode = 'search';
    }

    // Build messages array
    const messagesArr = [
      { role: "system", content: systemPrompts[useMode] || systemPrompts.general },
      ...history.slice(-10),
    ];

    // Image analysis
    if (imageBase64) {
      messagesArr.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: message || "What do you see in this image? Describe it in detail." }
        ]
      });
    } else {
      messagesArr.push({ role: "user", content: contextMessage });
    }

    // Use vision model for images
    const model = imageBase64
      ? "meta-llama/llama-4-scout-17b-16e-instruct"
      : "llama-3.3-70b-versatile";

    const completion = await groq.chat.completions.create({
      model,
      messages: messagesArr,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No response.";

    let savedChatId = chatId;
    if (mongoose.connection.readyState === 1) {
      let chat = chatId ? await Chat.findOne({ _id: chatId, uid: req.user.uid }) : null;
      if (!chat) chat = new Chat({ uid: req.user.uid, mode, title: message.slice(0, 60) });
      chat.messages.push({ role: "user", content: message });
      chat.messages.push({ role: "assistant", content: reply });
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
    return res.status(500).json({ message: "AI error: " + err.message });
  }
});

// ── History endpoints ─────────────────────────────────────────
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

app.get("/history/:id", requireAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, uid: req.user.uid });
    if (!chat) return res.status(404).json({ message: "Not found." });
    return res.json({ chat });
  } catch(err) { return res.status(500).json({ message: err.message }); }
});

app.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, uid: req.user.uid });
    return res.json({ success: true });
  } catch(err) { return res.status(500).json({ message: err.message }); }
});

app.listen(PORT, () => console.log(`🪐 MÎK AI v4.0 on port ${PORT}`));
