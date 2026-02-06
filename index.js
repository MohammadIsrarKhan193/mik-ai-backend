const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
let chatHistory = {};

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const id = userId || "Mohammad Israr";
    const prompt = message.toLowerCase();

    // 🎨 IMAGE GENERATION LOGIC
    if (prompt.includes("create") || prompt.includes("generate") || prompt.includes("draw") || prompt.includes("pic")) {
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(message)}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
      return res.json({ reply: `IMAGE_GEN:${imageUrl}` });
    }

    // 💬 TEXT LOGIC
    if (!chatHistory[id]) chatHistory[id] = [];
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are MÎK AI, a professional assistant created by Mohammad Israr." },
        ...chatHistory[id],
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    chatHistory[id].push({ role: "user", content: message }, { role: "assistant", content: reply });
    if (chatHistory[id].length > 10) chatHistory[id].shift();

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "MÎK AI is busy. Try again!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Online on ${PORT}`));
