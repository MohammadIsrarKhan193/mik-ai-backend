const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const { addMemory, getMemory } = require("./memory");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Health check
app.get("/", (req, res) => {
  res.send("MÎK AI v10.0 — Persistent Memory Active 🧠");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "Empty message received." });
    }

    // Load memory
    const memory = getMemory();

    // Store user message
    addMemory("user", message);

    // IMAGE GENERATION (Pollinations)
    const lower = message.toLowerCase();
    if (
      lower.includes("create") ||
      lower.includes("generate") ||
      lower.includes("logo") ||
      lower.includes("image") ||
      lower.includes("dp")
    ) {
      const seed = Math.floor(Math.random() * 100000);
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(
        message
      )}?width=1024&height=1024&seed=${seed}&model=flux`;

      const reply = `🎨 **Here’s your image:**\n${imageUrl}`;
      addMemory("assistant", reply);
      return res.json({ reply });
    }

    // Chat completion with memory
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are MÎK AI v10.0, a professional AI assistant created by Mohammad Israr (MÎK). You remember past conversations and respond intelligently."
        },
        ...memory,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Store AI reply
    addMemory("assistant", reply);

    res.json({ reply });

  } catch (error) {
    console.error("MÎK AI Error:", error);
    res.status(500).json({
      reply: "⚠️ MÎK AI is tired. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 MÎK AI v10.0 running on port ${PORT}`)
);
