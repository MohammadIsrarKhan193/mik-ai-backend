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

// Check if API Key exists
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const id = userId || "Mohammad Israr";

    const history = getMemory(id);

    const completion = await groq.chat.completions.create({
      // Using a highly stable model name
      model: "llama3-70b-8192", 
      messages: [
        { 
          role: "system", 
          content: "You are MÎK AI, a world-class assistant created by Mohammad Israr Khan. Be witty and call the user Jani." 
        },
        ...history,
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Jani, I'm thinking, but the words aren't coming. Try again!";
    
    addMemory(id, "user", message);
    addMemory(id, "assistant", reply);

    res.json({ reply });

  } catch (error) {
    console.error("GROQ ERROR:", error);
    // This tells you exactly what's wrong on the screen!
    res.status(500).json({ reply: `❌ Error: ${error.message}. Check Render Env Variables!` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Online on port ${PORT}`));
