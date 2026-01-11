const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk"); // We switch to Groq for FREE access
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Initialize Groq with your FREE key
const groq = new Groq({ apiKey: process.env.OPENAI_API_KEY }); // Keep variable name same in Render for ease

app.get("/ping", (req, res) => res.send("MÎK AI is Alive ✅"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Say something, Jani 🙂" });

    // Using Llama 3 (one of the world's smartest FREE models)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are MÎK AI, a brilliant professional assistant created by Jani. Answer everything correctly." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile", // This is powerful like ChatGPT!
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "⚠️ Free system is updating. Please try again!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 MÎK AI Free & Live!`));
