const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.static("public"));

// =======================
// MEMORY
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

// =======================
// CHAT ROUTE
// =======================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = "mik";

    const memoryData = loadMemory();
    const memory = memoryData[userId]?.join("\n") || "";

    // save name automatically
    if (
      message.toLowerCase().includes("my name is") ||
      message.toLowerCase().includes("i am") ||
      message.toLowerCase().includes("i'm")
    ) {
      if (!memoryData[userId]) memoryData[userId] = [];
      memoryData[userId].push(message);
      saveMemory(memoryData);
    }

    const prompt = `
You are MÎK AI 🎤, created by Mohammad Israr "MÎK".
You remember user details across messages.

Memory:
${memory || "No memory yet"}

User: ${message}
MÎK AI:
`;

    const aiRes = await fetch("https://api.pollinations.ai/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        prompt,
        max_tokens: 200
      })
    });

    const reply = await aiRes.text();

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Server error 😢" });
  }
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("✅ MÎK AI Server Running");
});
