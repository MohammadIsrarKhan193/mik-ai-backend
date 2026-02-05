const express = require("express");
const Groq = require("groq-sdk");
const cors = require("cors");
const { addMemory, getMemory } = require("./memory");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const id = userId || "Mohammad Israr";
    const memory = getMemory(id);
    addMemory(id, "user", message);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are MÎK AI, a world-class assistant. Answer professionally using Markdown for code." },
        ...memory,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    addMemory(id, "assistant", reply);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "⚠️ AI is busy. Try again!" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 MÎK AI ONLINE"));
