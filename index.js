// ============================================================
//  MÎK AI — index.js  (Node.js / Railway Backend)
//  Firebase Auth + Cloud Chat History + Groq AI
//  Built by Mohammad Israr Khan (Afghanistan) 🪐
// ============================================================

const express   = require("express");
const cors      = require("cors");
const admin     = require("firebase-admin");
const jwt       = require("jsonwebtoken");
const mongoose  = require("mongoose");
const Groq      = require("groq-sdk");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());
app.use(express.static("public")); // serve your frontend from /public

// ── Firebase Admin ────────────────────────────────────────────
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ── Groq ──────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── MongoDB (for cloud chat history) ─────────────────────────
// Set MONGO_URI in Railway environment variables
// Free cluster: https://cloud.mongodb.com
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(e  => console.error("❌ MongoDB error:", e.message));
}

// ── Mongoose schemas ──────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  role:    { type:String, enum:["user","assistant"], required:true },
  content: { type:String, required:true },
}, { _id:false });

const ChatSchema = new mongoose.Schema({
  uid:          { type:String, required:true, index:true },
  title:        { type:String, default:"New Chat" },
  mode:         { type:String, default:"general" }, // general|islamic|image|quiz
  messages:     [MessageSchema],
  lastMessage:  String,
  messageCount: { type:Number, default:0 },
  createdAt:    { type:Date, default:Date.now },
  updatedAt:    { type:Date, default:Date.now },
});
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

const UserStatsSchema = new mongoose.Schema({
  uid:           { type:String, required:true, unique:true },
  totalChats:    { type:Number, default:0 },
  totalMessages: { type:Number, default:0 },
  firstSeen:     { type:Date,   default:Date.now },
  lastSeen:      { type:Date,   default:Date.now },
});
const UserStats = mongoose.models.UserStats || mongoose.model("UserStats", UserStatsSchema);

// ── JWT ───────────────────────────────────────────────────────
const JWT_SECRET  = process.env.JWT_SECRET  || "mik-ai-secret-change-me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── Auth middleware ───────────────────────────────────────────
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

// ── Health ────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status:"🪐 MÎK AI is live", version:"2.0.0" });
});

// ─────────────────────────────────────────────────────────────
//  POST /auth/google — verify Firebase token → return JWT
// ─────────────────────────────────────────────────────────────
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

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // Upsert user stats
    await UserStats.findOneAndUpdate(
      { uid: user.uid },
      { $set: { lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } },
      { upsert: true }
    );

    console.log(`✅ Auth: ${user.email}`);
    return res.json({ success:true, token, user });
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid token." });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /me — return current user
// ─────────────────────────────────────────────────────────────
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─────────────────────────────────────────────────────────────
//  POST /chat — send message to Groq, save to cloud history
// ─────────────────────────────────────────────────────────────
app.post("/chat", requireAuth, async (req, res) => {
  const { message, mode = "general", chatId, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "message required." });

  // Build system prompt based on mode
  const systemPrompts = {
    general: "You are MÎK AI, a helpful, smart, and friendly assistant created by Mohammad Israr Khan from Afghanistan. Be concise and helpful.",
    islamic: "You are MÎK AI in Islamic Mode. Answer questions about Islam with care, accuracy, and respect. Cite Quran/Hadith where relevant. Always say Bismillah at the start.",
    image:   "You are MÎK AI. Help the user craft vivid image generation prompts. Be descriptive and creative.",
    quiz:    "You are MÎK AI Quiz Master. Generate multiple-choice quiz questions on the topic the user provides. Format: Question, then A/B/C/D options, then the correct answer.",
  };

  const systemPrompt = systemPrompts[mode] || systemPrompts.general;

  // Build messages array for Groq
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10), // last 10 messages for context
    { role: "user",   content: message },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages,
      max_tokens:  1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No response.";

    // Save to MongoDB if connected
    let savedChatId = chatId;
    if (mongoose.connection.readyState === 1) {
      let chat;
      if (chatId) {
        chat = await Chat.findOne({ _id: chatId, uid: req.user.uid });
      }
      if (!chat) {
        chat = new Chat({ uid: req.user.uid, mode, title: message.slice(0, 60) });
      }
      chat.messages.push({ role:"user", content:message });
      chat.messages.push({ role:"assistant", content:reply });
      chat.lastMessage  = reply.slice(0, 100);
      chat.messageCount = chat.messages.length;
      chat.updatedAt    = new Date();
      await chat.save();
      savedChatId = chat._id;

      // Update stats
      await UserStats.findOneAndUpdate(
        { uid: req.user.uid },
        { $inc: { totalMessages: 1 }, $set: { lastSeen: new Date() } }
      );
    }

    return res.json({ reply, chatId: savedChatId });
  } catch (err) {
    console.error("Groq error:", err.message);
    return res.status(500).json({ message: "AI error. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /history — get user's cloud chat history + stats
// ─────────────────────────────────────────────────────────────
app.get("/history", requireAuth, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ history:[], stats: { totalChats:0, totalMessages:0, daysActive:1 } });
  }
  try {
    const [history, stats] = await Promise.all([
      Chat.find({ uid: req.user.uid })
          .sort({ updatedAt: -1 })
          .limit(50)
          .select("-messages"), // Don't send full message arrays in list
      UserStats.findOne({ uid: req.user.uid }),
    ]);

    const daysActive = stats?.firstSeen
      ? Math.max(1, Math.ceil((Date.now() - new Date(stats.firstSeen)) / 86400000))
      : 1;

    return res.json({
      history,
      stats: {
        totalChats:    history.length,
        totalMessages: stats?.totalMessages || 0,
        daysActive,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /history/:id — get single chat with full messages
// ─────────────────────────────────────────────────────────────
app.get("/history/:id", requireAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, uid: req.user.uid });
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    return res.json({ chat });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  DELETE /history/:id — delete a chat
// ─────────────────────────────────────────────────────────────
app.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, uid: req.user.uid });

    // Update chat count in stats
    const remaining = await Chat.countDocuments({ uid: req.user.uid });
    await UserStats.findOneAndUpdate({ uid: req.user.uid }, { $set: { totalChats: remaining } });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
//  Start
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🪐 MÎK AI backend running on port ${PORT}`);
});
