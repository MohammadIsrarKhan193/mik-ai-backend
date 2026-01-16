const express = require("express");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🧠 MEMORY (session-based)
let conversation = [
  {
    role: "system",
    content:
      "You are MÎK AI, an intelligent, friendly assistant created by Mohammad Israr. Be clear, helpful, and professional."
  }
];

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Add user message to memory
    conversation.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: conversation
    });

    const reply = completion.choices[0].message.content;

    // Add AI reply to memory
    conversation.push({ role: "assistant", content: reply });

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "MÎK AI brain overload 🧠⚡" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MÎK AI v3.0 running"));
