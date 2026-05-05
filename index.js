// ============================================================
//  MÎK AI — index.js  (Node.js / Railway Backend)
//  Firebase Google Token Verification + JWT Session
//  Built by Mohammad Israr Khan (Afghanistan)
// ============================================================

const express    = require("express");
const cors       = require("cors");
const admin      = require("firebase-admin");
const jwt        = require("jsonwebtoken");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────
// Allow your frontend origin(s) — update as needed
app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    process.env.FRONTEND_URL || "*",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ── Firebase Admin Init ───────────────────────────────────────
// Option A: service account JSON in env var (recommended for Railway)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  // Option B: local file (dev only — add to .gitignore!)
  serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// ── JWT secret (set in Railway environment variables) ─────────
const JWT_SECRET  = process.env.JWT_SECRET  || "mik-ai-secret-change-me";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "🪐 MÎK AI backend is live", version: "1.0.0" });
});

// ── POST /auth/google ─────────────────────────────────────────
// Frontend sends the Firebase idToken; we verify it and return a session JWT
app.post("/auth/google", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "idToken is required." });
  }

  try {
    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = {
      uid:   decoded.uid,
      name:  decoded.name  || "Anonymous",
      email: decoded.email || "",
      photo: decoded.picture || "",
    };

    // Issue your own session JWT
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    console.log(`[MÎK AI] ✅ User signed in: ${user.email}`);

    return res.json({
      success: true,
      token,
      user,
    });

  } catch (err) {
    console.error("[MÎK AI] Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ── Middleware: verify session JWT ───────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token." });
  }
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid or expired." });
  }
}

// ── Protected: GET /me ────────────────────────────────────────
app.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── Protected: POST /chat ─────────────────────────────────────
// Placeholder — plug your Groq logic here
app.post("/chat", requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "message is required." });
  }
  // TODO: call Groq API with req.user context
  res.json({
    reply: `[MÎK AI] Echo from ${req.user.name}: "${message}" — Groq integration coming soon.`,
  });
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🪐 MÎK AI backend running on port ${PORT}`);
});
