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

    if (!message) return res.status(400).json({ reply: "Empty message." });

    const memory = getMemory(id);
    addMemory(id, "user", message);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are MÎK AI Helper, a world-class expert assistant created by Mohammad Israr. 
          Respond with clear, helpful, and professional answers. Use Markdown for code blocks.` 
        },
        ...memory,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    addMemory(id, "assistant", reply);
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "⚠️ MÎK AI is recalibrating. Please try again." });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 MÎK AI Brand Online"));
