const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Simple in-memory storage (Resets when server restarts on Free Tier)
let chatHistory = {};

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const id = userId || "Mohammad Israr";

    if (!chatHistory[id]) chatHistory[id] = [];
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are MÎK AI, a professional assistant created by Mohammad Israr. Use Markdown." },
        ...chatHistory[id],
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    
    // Save to history
    chatHistory[id].push({ role: "user", content: message });
    chatHistory[id].push({ role: "assistant", content: reply });
    if (chatHistory[id].length > 10) chatHistory[id].shift();

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "MÎK AI is having a brain freeze. Check your GROQ_API_KEY!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
