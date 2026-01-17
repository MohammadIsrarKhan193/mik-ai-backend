const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.static("public"));

// =======================
// MEMORY FILE
// =======================
const MEMORY_FILE = "memory.json";

if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({}));
}

function loadMemory() {
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

function addMemory(text, userId) {
  const memory = loadMemory();
  if (!memory[userId]) memory[userId] = [];
  memory[userId].push(text);
  saveMemory(memory);
}

// =======================
// CHAT API
// =======================
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const userId = "mik"; // single-user for now

  let memory = loadMemory()[userId]?.join("\n") || "";

  const lowerMsg = message.toLowerCase();

  // 🧠 SMART MEMORY DETECTION (V10.1)
  if (
    lowerMsg.includes("my name is") ||
    lowerMsg.includes("i am ") ||
    lowerMsg.includes("i'm ") ||
    lowerMsg.includes("i’m ") ||
    lowerMsg.includes("call me")
  ) {
    addMemory(`User name info: ${message}`, userId);
  }

  if (lowerMsg.includes("remember that")) {
    addMemory(`Important: ${message}`, userId);
  }

  // =======================
  // AI PROMPT
  // =======================
  const prompt = `
You are MÎK AI 🎤, a friendly, intelligent assistant created by Mohammad Israr "MÎK".

Memory:
${memory || "No memory yet."}

User: ${message}
MÎK AI:
`;

  try {
    const response = await fetch("https://api.pollinations.ai/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        prompt: prompt,
        max_tokens: 200
      })
    });

    const data = await response.text();

    res.json({
      reply: data.trim()
    });

  } catch (err) {
    res.json({
      reply: "Sorry 😢 I had trouble responding."
    });
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`✅ MÎK AI running at http://localhost:${PORT}`);
});
