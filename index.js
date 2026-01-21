import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { getMemory, saveMemory } from "./memory.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message;
    if (!userMsg) {
      return res.json({ reply: "Empty message." });
    }

    const history = getMemory();

    history.push({ role: "user", content: userMsg });

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: history,
          temperature: 0.7
        })
      }
    );

    const data = await groqRes.json();
    const reply =
      data.choices?.[0]?.message?.content || "No response from AI.";

    history.push({ role: "assistant", content: reply });
    saveMemory(history);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Brain overload 😵 Try again." });
  }
});

app.listen(3000, () => {
  console.log("🧠 MÎK AI backend running on port 3000");
});
