const express = require("express");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* 🧠 MEMORY STORE (SESSION BASED) */
let memory = [
  {
    role: "system",
    content:
      "You are MÎK AI v8.0, a professional AI created by Mohammad Israr. You remember past messages and respond naturally like ChatGPT."
  }
];

/* 🎨 IMAGE INTENT CHECK */
function isImagePrompt(text) {
  const keywords = [
    "create image",
    "generate image",
    "make image",
    "create dp",
    "generate dp",
    "logo",
    "poster",
    "pic",
    "picture",
    "illustration",
    "art"
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
}

/* 🧠 CHAT ROUTE */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ reply: "Say something, Jani 😊" });
    }

    /* 🎨 IMAGE GENERATION (V7 SAFE) */
    if (isImagePrompt(message)) {
      const seed = Math.floor(Math.random() * 99999);
      const imageURL = `https://pollinations.ai/p/${encodeURIComponent(
        message
      )}?width=1024&height=1024&seed=${seed}&model=flux`;

      memory.push({ role: "user", content: message });
      memory.push({
        role: "assistant",
        content: "I generated an image for the user."
      });

      return res.json({
        reply: `🎨 **Here’s your image:**\n${imageURL}`
      });
    }

    /* 🧠 STORE USER MESSAGE */
    memory.push({ role: "user", content: message });

    /* 🔁 LIMIT MEMORY (VERY IMPORTANT) */
    if (memory.length > 12) {
      memory = memory.slice(-10);
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: memory
    });

    const aiReply = completion.choices[0].message.content;

    /* 🧠 STORE AI REPLY */
    memory.push({ role: "assistant", content: aiReply });

    res.json({ reply: aiReply });

  } catch (err) {
    console.error("MÎK AI Error:", err);
    res.status(500).json({
      reply: "⚠️ MÎK AI brain overloaded. Try again."
    });
  }
});

/* 🚀 SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ MÎK AI v8.0 running on port ${PORT}`)
);
