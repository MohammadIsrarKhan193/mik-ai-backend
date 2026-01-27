import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import { addMemory, getMemory } from "./memory.js";
import dotenv from "dotenv";

dotenv.config();

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

    // 1. Get previous chat history
    const history = getMemory(id);

    // 2. Call the AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are MÎK AI Helper, a world-class executive assistant created by Mohammad Israr Khan (MÎK). 
          You are witty, helpful, and you call the user 'Jani'. Use Markdown for code.` 
        },
        ...history,
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices[0].message.content;

    // 3. Save this conversation to memory
    addMemory(id, "user", message);
    addMemory(id, "assistant", reply);

    res.json({ reply });

  } catch (error) {
    console.error("MÎK Error:", error);
    res.status(500).json({ reply: "⚠️ MÎK AI is recalibrating. Check your API Key, Jani!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK Brand Online at http://localhost:${PORT}`));
